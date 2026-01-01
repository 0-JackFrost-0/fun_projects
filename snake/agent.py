import torch
import random
import numpy as np
from collections import deque
from snake_game import SnakeGame
from model import Linear_QNet, QTrainer
from helper import plot

MAX_MEMORY = 100_000
BATCH_SIZE = 1000
LR = 0.001

class Agent:

    def __init__(self):
        self.n_games = 0
        self.epsilon = 0 # randomness
        self.gamma = 0.9 # discount rate
        self.memory = deque(maxlen=MAX_MEMORY) # popleft()
        self.model = Linear_QNet(11, 256, 3)
        self.trainer = QTrainer(self.model, lr=LR, gamma=self.gamma)
        
        # Anti-looping mechanism
        self.position_history = deque(maxlen=10)  # Track recent positions
        self.last_action = None

    def get_state(self, game):
        head = game.snake_pos
        future_positions = [
            # UP
            (head[0], head[1] - 10),
            # RIGHT
            (head[0] + 10, head[1]),
            # DOWN
            (head[0], head[1] + 10),
            # LEFT
            (head[0] - 10, head[1]),
        ]
        current_direction = [
            # UP
            game.direction == 'UP',
            # RIGHT
            game.direction == 'RIGHT',
            # DOWN
            game.direction == 'DOWN',
            # LEFT
            game.direction == 'LEFT',
        ]

        # danger straight, danger right, danger left
        danger = [False, False, False]
        for i in range(len(danger)):
            if i == 2:
                step = i+1
            else:
                step = i
            for j in range(len(future_positions)):
                if game.out_of_bounds(future_positions[(j+step)%4]) and current_direction[j] or \
                future_positions[(j+step)%4] in game.snake_body:
                    danger[i] = True
                    break
        
        state = danger + current_direction
        state.extend(
            [
                game.food_pos[0] <= head[0], # food is right of head
                game.food_pos[0] >= head[0], # food is left of head
                game.food_pos[1] <= head[1], # food is above head
                game.food_pos[1] >= head[1], # food is below head
            ]
        )
        
        return np.array(state, dtype=int)

    def calculate_reward(self, game, reward, game_over):
        """Calculate enhanced reward to discourage looping"""
        enhanced_reward = reward
        
        # Track position for loop detection
        current_pos = tuple(game.snake_pos)
        self.position_history.append(current_pos)
        
        # Penalty for revisiting recent positions (looping)
        if len(self.position_history) >= 4:
            recent_positions = list(self.position_history)[-4:]
            if recent_positions.count(current_pos) > 1:
                enhanced_reward -= 2  # Penalty for looping
        
        # Small reward for getting closer to food
        if not game_over and reward == 0:  # No food eaten, but still alive
            head_x, head_y = game.snake_pos
            food_x, food_y = game.food_pos
            
            # Calculate Manhattan distance to food
            distance = abs(head_x - food_x) + abs(head_y - food_y)
            # Small reward for getting closer (max reward of 1)
            enhanced_reward += max(0, 1 - distance / 100)
        
        return enhanced_reward
        
    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done)) # popleft if MAX_MEMORY is reached

 
    def train_long_memory(self):
        if len(self.memory) > BATCH_SIZE:
            mini_sample = random.sample(self.memory, BATCH_SIZE)
        else:
            mini_sample = self.memory

        states, actions, rewards, next_states, dones = zip(*mini_sample)
        self.trainer.train_step(states, actions, rewards, next_states, dones)


    def train_short_memory(self, old_state, action, reward, new_state, done):
        self.trainer.train_step(old_state, action, reward, new_state, done)

    def get_action(self, state):
        # Better exploration strategy - slower epsilon decay
        self.epsilon = max(10, 80 - self.n_games * 0.5)  # Slower decay, minimum exploration
        final_move = [0, 0, 0]
        
        if random.randint(0, 200) < self.epsilon:
            move = random.randint(0, 2)
            final_move[move] = 1
        else:
            state0 = torch.tensor(state, dtype=torch.float)
            prediction = self.model(state0)
            move = torch.argmax(prediction).item()
            final_move[move] = 1
        
        # Anti-looping: penalize repeated actions
        if self.last_action is not None and final_move == self.last_action:
            # Small chance to force a different action
            if random.random() < 0.1:
                available_moves = [0, 1, 2]
                available_moves.remove(final_move.index(1))
                new_move = random.choice(available_moves)
                final_move = [0, 0, 0]
                final_move[new_move] = 1
        
        self.last_action = final_move.copy()
        return final_move

def train():
    plot_scores = []
    plot_mean_scores = []
    total_score = 0
    record = 0
    agent = Agent()
    game = SnakeGame(difficulty=1080)
    while True:
        old_state = agent.get_state(game)
        move = agent.get_action(old_state)
        
        # Set the action for the game
        game.action = move
        game.move_snake()
        game.frame_iterations += 1
        
        reward, game_over, score = game.update_game_state()
        
        # Use enhanced reward system to discourage looping
        enhanced_reward = agent.calculate_reward(game, reward, game_over)
        
        new_state = agent.get_state(game)

        # Render the game to show the GUI
        game.render()
        
        # Control the frame rate to match the difficulty setting
        game.fps_controller.tick(game.difficulty)

        agent.train_short_memory(old_state, move, enhanced_reward, new_state, game_over)

        agent.remember(old_state, move, enhanced_reward, new_state, game_over)

        if game_over:
            # train long memory, plot result
            game.reset()
            agent.n_games += 1
            agent.train_long_memory()
            
            # Reset anti-looping mechanisms
            agent.position_history.clear()
            agent.last_action = None

            if score > record:
                record = score
                # agent.model.save()
            
            print('Game', agent.n_games, 'Score', score, 'Record', record)

            plot_scores.append(score)
            total_score += score
            mean_score = total_score / agent.n_games
            plot_mean_scores.append(mean_score)
            plot(plot_scores, plot_mean_scores) 


if __name__ == "__main__":
    train()