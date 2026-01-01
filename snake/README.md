# 🐍 Snake AI - Deep Q-Learning

A reinforcement learning project where an AI agent learns to play the classic Snake game using Deep Q-Networks (DQN) implemented with PyTorch.

![Snake AI Demo](https://img.shields.io/badge/Game-Snake-green) ![Python](https://img.shields.io/badge/Python-3.7+-blue) ![PyTorch](https://img.shields.io/badge/PyTorch-Latest-orange) ![Pygame](https://img.shields.io/badge/Pygame-2.0+-red)

## 🎯 Project Overview

This project implements a Deep Q-Learning agent that learns to play Snake from scratch. The AI starts with no knowledge of the game and gradually improves through trial and error, eventually becoming capable of achieving high scores by learning optimal strategies.

## ✨ Features

- **Deep Q-Network (DQN)** implementation with PyTorch
- **Anti-looping mechanisms** to prevent repetitive behavior
- **Real-time visualization** of training progress
- **Configurable training speed** and rendering options
- **Enhanced reward system** with distance-based incentives
- **Position tracking** to discourage inefficient paths
- **Adaptive exploration** with epsilon decay strategy

## 🚀 Quick Start

### Prerequisites

```bash
python 3.7+
pip install -r requirements.txt
```

### Installation

1. Clone or download this repository
2. Install dependencies:
```bash
pip install torch pygame matplotlib numpy ipython
```

3. Run the training:
```bash
python agent.py
```

## 🎮 Usage

### Basic Training
```python
python agent.py
```

### Training Options
You can modify the training parameters in `agent.py`:

```python
# Slow training with visual feedback (recommended for watching)
game = SnakeGame(difficulty=10)

# Fast training for quick results
game = SnakeGame(difficulty=60)

# Ultra-fast training (current setting)
game = SnakeGame(difficulty=1080)
```

### Rendering Control
The game renders by default. The training loop includes:
- Visual game window showing the snake's progress
- Real-time matplotlib plots of scores and mean scores
- Console output with game statistics

## 🧠 How It Works

### Deep Q-Learning Architecture

The AI uses a neural network to learn the optimal action for each game state:

```
Input State (11 features) → Hidden Layer (256 neurons) → Output Actions (3 actions)
```

### State Representation (11 features):
1. **Danger detection** (3): Straight, Right, Left
2. **Current direction** (4): Up, Down, Left, Right  
3. **Food location** (4): Relative to snake head

### Action Space (3 actions):
- **[1,0,0]**: Continue straight
- **[0,1,0]**: Turn right
- **[0,0,1]**: Turn left

### Reward System:
- **+10**: Eating food
- **-10**: Game over (collision/boundary)
- **-2**: Revisiting recent positions (anti-looping)
- **+0-1**: Small reward for moving toward food

### Anti-Looping Features:
- Position history tracking (last 10 positions)
- Action randomization (10% chance to break patterns)
- Penalty for repetitive movements
- Slower epsilon decay for sustained exploration

## 📁 File Structure

```
snake/
├── agent.py          # Main training script and Agent class
├── model.py          # Neural network and trainer implementation
├── snake_game.py     # Pygame-based Snake game environment
├── helper.py         # Plotting utilities for training visualization
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

### Key Classes:

- **`Agent`**: Implements the DQN agent with memory, exploration, and anti-looping
- **`Linear_QNet`**: Neural network architecture for Q-value estimation
- **`QTrainer`**: Training logic with loss calculation and backpropagation
- **`SnakeGame`**: Game environment with rendering and game logic

## ⚙️ Training Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MAX_MEMORY` | 100,000 | Experience replay buffer size |
| `BATCH_SIZE` | 1,000 | Training batch size |
| `LR` | 0.001 | Learning rate |
| `gamma` | 0.9 | Discount factor |
| `epsilon` | 80→10 | Exploration rate (decays slowly) |
| `hidden_size` | 256 | Neural network hidden layer size |

## 📊 Training Progress

The AI's learning progress is visualized through:

1. **Game Window**: Real-time snake gameplay
2. **Score Plots**: Individual game scores over time
3. **Mean Score**: Running average performance
4. **Console Output**: Game number, current score, record score

### Typical Learning Progression:
- **Games 1-100**: Random exploration, scores 0-2
- **Games 100-500**: Learning basic survival, scores 2-5  
- **Games 500-1000**: Developing food-seeking behavior, scores 5-15
- **Games 1000+**: Optimizing strategies, scores 15+

## 🎛️ Customization

### Adjust Game Speed
```python
# In agent.py, modify the SnakeGame initialization:
game = SnakeGame(difficulty=10)   # Slow (10 FPS)
game = SnakeGame(difficulty=30)   # Medium (30 FPS)  
game = SnakeGame(difficulty=60)   # Fast (60 FPS)
```

### Network Architecture
```python
# In agent.py, modify the model initialization:
self.model = Linear_QNet(11, 256, 3)  # input, hidden, output
self.model = Linear_QNet(11, 512, 3)  # Larger network
```

### Reward Tuning
```python
# In agent.py, modify calculate_reward method:
enhanced_reward -= 2  # Loop penalty (adjust value)
enhanced_reward += max(0, 1 - distance / 100)  # Distance reward
```

## 🐛 Troubleshooting

### Common Issues:

**Game window not showing:**
- Ensure `game.render()` is called in the training loop
- Check that pygame is properly installed

**Training too fast to observe:**
- Lower the difficulty setting: `SnakeGame(difficulty=10)`
- The difficulty parameter controls FPS

**Poor learning performance:**
- Increase exploration: modify epsilon decay rate
- Adjust reward values in `calculate_reward()`
- Try different network architectures

**Memory issues:**
- Reduce `MAX_MEMORY` or `BATCH_SIZE`
- Monitor system memory usage during training

## 🔮 Future Improvements

- [ ] Model saving and loading functionality
- [ ] Hyperparameter optimization
- [ ] Different neural network architectures (CNN, LSTM)
- [ ] Multi-agent training environments
- [ ] Performance benchmarking tools
- [ ] Web-based training interface

## 📈 Performance Tips

1. **For Learning Observation**: Use `difficulty=10` to watch the AI learn
2. **For Fast Training**: Use `difficulty=60+` to accelerate learning
3. **For Debugging**: Add print statements in reward calculation
4. **For Better Performance**: Train for 2000+ games for optimal results

## 🤝 Contributing

Feel free to fork this project and submit improvements! Areas for contribution:
- Network architecture experiments
- Reward function optimization
- UI/UX improvements
- Performance optimizations

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Training! 🎮🤖**

*Watch your AI evolve from random movements to strategic gameplay!*
