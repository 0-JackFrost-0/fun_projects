"""
Snake Eater
Made with PyGame
"""

import pygame
import sys
import time
import random


class SnakeGame:
    # Difficulty settings
    # Easy      ->  10
    # Medium    ->  25
    # Hard      ->  40
    # Harder    ->  60
    # Impossible->  120
    
    def __init__(self, difficulty=10, frame_size_x=720, frame_size_y=480):
        self.difficulty = difficulty
        self.frame_size_x = frame_size_x
        self.frame_size_y = frame_size_y
        
        # Initialize pygame
        check_errors = pygame.init()
        if check_errors[1] > 0:
            print(f'[!] Had {check_errors[1]} errors when initialising game, exiting...')
            sys.exit(-1)
        else:
            print('[+] Game successfully initialised')
        
        # Initialize game window
        pygame.display.set_caption('Snake Eater')
        self.game_window = pygame.display.set_mode((self.frame_size_x, self.frame_size_y))
        
        # Colors (R, G, B)
        self.black = pygame.Color(0, 0, 0)
        self.white = pygame.Color(255, 255, 255)
        self.red = pygame.Color(255, 0, 0)
        self.green = pygame.Color(0, 255, 0)
        self.blue = pygame.Color(0, 0, 255)
        
        # Action direction mapping
        self.action_direction = {
            'UP': ['UP', 'RIGHT', 'LEFT'],
            'DOWN': ['DOWN', 'LEFT', 'RIGHT'],
            'LEFT': ['LEFT', 'UP', 'DOWN'],
            'RIGHT': ['RIGHT', 'DOWN', 'UP']
        }
        
        # FPS controller
        self.fps_controller = pygame.time.Clock()
        
        # Game variables
        self.iterations = 0
        self.frame_iterations = 0
        self.snake_pos = None
        self.snake_body = None
        self.food_pos = None
        self.food_spawn = None
        self.direction = None
        self.action = None
        self.score = None
        
        # Initialize game state
        self.reset()
    
    def reset(self):
        """Reset the game to initial state"""
        self.snake_pos = [100, 50]
        self.snake_body = [[100, 50], [100-10, 50], [100-(2*10), 50]]
        
        self.food_pos = [
            random.randrange(1, (self.frame_size_x//10)) * 10,
            random.randrange(1, (self.frame_size_y//10)) * 10
        ]
        self.food_spawn = True
        
        self.direction = 'RIGHT'
        self.action = [1, 0, 0]
        
        self.score = 0
        self.frame_iterations = 0
    
    def game_over(self):
        """Display game over screen and exit"""
        reward = -10
        my_font = pygame.font.SysFont('times new roman', 90)
        game_over_surface = my_font.render('YOU DIED', True, self.red)
        game_over_rect = game_over_surface.get_rect()
        game_over_rect.midtop = (self.frame_size_x/2, self.frame_size_y/4)
        self.game_window.fill(self.black)
        self.game_window.blit(game_over_surface, game_over_rect)
        self.show_score(0, self.red, 'times', 20)
        pygame.display.flip()
        time.sleep(3)
        pygame.quit()
        sys.exit()
    
    def out_of_bounds(self, snake_pos):
        """Check if snake is out of bounds or colliding with itself"""
        if snake_pos[0] < 0 or snake_pos[0] > self.frame_size_x-10:
            return True
        if snake_pos[1] < 0 or snake_pos[1] > self.frame_size_y-10:
            return True
        for block in self.snake_body[1:]:
            if snake_pos[0] == block[0] and snake_pos[1] == block[1]:
                return True
        return False
    
    def show_score(self, choice, color, font, size):
        """Display the score on screen"""
        score_font = pygame.font.SysFont(font, size)
        score_surface = score_font.render('Score : ' + str(self.score), True, color)
        score_rect = score_surface.get_rect()
        if choice == 1:
            score_rect.midtop = (self.frame_size_x/10, 15)
        else:
            score_rect.midtop = (self.frame_size_x/2, self.frame_size_y/1.25)
        self.game_window.blit(score_surface, score_rect)
    
    def move_snake(self):
        """Move the snake based on the current action"""
        self.direction = self.action_direction[self.direction][self.action.index(1)]
        
        # Moving the snake
        if self.direction == 'UP':
            self.snake_pos[1] -= 10
        if self.direction == 'DOWN':
            self.snake_pos[1] += 10
        if self.direction == 'LEFT':
            self.snake_pos[0] -= 10
        if self.direction == 'RIGHT':
            self.snake_pos[0] += 10
        
        # Reset action to straight
        self.action = [1, 0, 0]
    
    def handle_events(self):
        """Handle pygame events"""
        reward = 0
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                reward = -10
                pygame.quit()
                sys.exit()
            # Whenever a key is pressed down
            elif event.type == pygame.KEYDOWN:
                if event.key == ord('r'):
                    self.reset()
                # W -> Up; S -> Down; A -> Left; D -> Right
                if event.key == pygame.K_UP or event.key == ord('w'):
                    self.frame_iterations += 1
                    if self.direction == 'UP' or self.direction == 'DOWN':
                        self.action = [1, 0, 0]
                    elif self.direction == 'RIGHT':
                        self.action = [0, 0, 1]
                    elif self.direction == 'LEFT':
                        self.action = [0, 1, 0]
                if event.key == pygame.K_DOWN or event.key == ord('s'):
                    self.frame_iterations += 1
                    if self.direction == 'UP' or self.direction == 'DOWN':
                        self.action = [1, 0, 0]
                    elif self.direction == 'RIGHT':
                        self.action = [0, 1, 0]
                    elif self.direction == 'LEFT':
                        self.action = [0, 0, 1]
                if event.key == pygame.K_LEFT or event.key == ord('a'):
                    self.frame_iterations += 1
                    if self.direction == 'LEFT' or self.direction == 'RIGHT':
                        self.action = [1, 0, 0]
                    elif self.direction == 'UP':
                        self.action = [0, 0, 1]
                    elif self.direction == 'DOWN':
                        self.action = [0, 1, 0]
                if event.key == pygame.K_RIGHT or event.key == ord('d'):
                    self.frame_iterations += 1
                    if self.direction == 'LEFT' or self.direction == 'RIGHT':
                        self.action = [1, 0, 0]
                    elif self.direction == 'UP':
                        self.action = [0, 1, 0]
                    elif self.direction == 'DOWN':
                        self.action = [0, 0, 1]
                # Esc -> Create event to quit the game
                if event.key == pygame.K_ESCAPE:
                    pygame.event.post(pygame.event.Event(pygame.QUIT))
        return reward
    
    def update_game_state(self):
        """Update the game state and check game over conditions. Returns (reward, game_over, score)."""
        reward = 0
        game_over = False
        
        # Snake body growing mechanism
        self.snake_body.insert(0, list(self.snake_pos))
        if self.snake_pos[0] == self.food_pos[0] and self.snake_pos[1] == self.food_pos[1]:
            self.score += 1
            reward = 10
            self.food_spawn = False
        else:
            self.snake_body.pop()
        
        # Spawning food on the screen
        if not self.food_spawn:
            self.food_pos = [
                random.randrange(1, (self.frame_size_x//10)) * 10,
                random.randrange(1, (self.frame_size_y//10)) * 10
            ]
        self.food_spawn = True
        
        # Check game over conditions
        # Getting out of bounds or hitting self
        if self.out_of_bounds(self.snake_pos):
            reward = -10
            game_over = True
        
        # Too many iterations without progress
        if self.frame_iterations > 100 * len(self.snake_body):
            reward = -10
            game_over = True
        
        # Snake fills the entire screen (win condition)
        max_snake_length = (self.frame_size_x // 10) * (self.frame_size_y // 10)
        if len(self.snake_body) >= max_snake_length:
            reward = 10  # Positive reward for winning
            game_over = True
        
        return reward, game_over, self.score
    
    def render(self):
        """Render the game graphics"""
        self.game_window.fill(self.black)
        
        # Draw snake body
        for pos in self.snake_body:
            pygame.draw.rect(self.game_window, self.green, pygame.Rect(pos[0], pos[1], 10, 10))
        
        # Draw food
        pygame.draw.rect(self.game_window, self.white, pygame.Rect(self.food_pos[0], self.food_pos[1], 10, 10))
        
        # Show score
        self.show_score(1, self.white, 'consolas', 20)
        
        # Update display
        pygame.display.update()
    
    def run(self):
        """Main game loop"""
        while True:
            # Handle events
            self.handle_events()
            
            # Move snake
            self.move_snake()
            
            # Update game state and check for game over
            reward, game_over, score = self.update_game_state()
            
            # Render graphics
            self.render()
            
            # If game is over, show game over screen
            if game_over:
                self.game_over()
            
            # Control frame rate
            self.fps_controller.tick(self.difficulty)


if __name__ == '__main__':
    game = SnakeGame(difficulty=10)
    game.run()
