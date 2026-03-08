# snake

It's the classical snake game.
The objective is to earn the highest score humanily possible.
Score is synonymous to the amount of candy the snake consumes.
It's game over as soon as the snake collides with a wall or itself.
Snake is constanly slithering unless game is paused (p keypress) or is game over.
The snakes slither speed increases as the score increments.

## AI Training

The game includes a neuroevolution-based AI that learns to play snake through
unsupervised training. A genetic algorithm evolves a population of feedforward
neural networks — no labeled data or human demonstrations required.

**Architecture:** Each agent uses an 8-directional raycasting vision system
(24 inputs) fed into a neural network (24 → 18 → 18 → 4) that outputs
direction decisions. The genetic algorithm uses tournament selection,
single-point crossover, and Gaussian mutation. Starting positions and
directions are randomized each game to prevent overfitting.

**Speed curve:** Difficulty uses an arcade-style bit-shift formula
(`base >> (score >> divisor)`) that doubles speed every 16 points and
never produces negative intervals. Games are time-limited (default 100s)
to reward efficient food-seeking over edge-following.

### Executables

All executables are in `bin/` and require Node.js.

**Train a model:**

```
bin/train [options]
  --generations N   Number of generations (default: 100)
  --population N    Population size (default: 1000)
  --games N         Games per fitness evaluation (default: 8)
  --time N          Game time limit in seconds (default: 100)
  --output PATH     Model output path (default: models/best.json)
```

**Evaluate a trained model:**

```
bin/eval [options]
  --model PATH      Model to load (default: models/best.json)
  --games N         Number of evaluation games (default: 100)
  --time N          Game time limit in seconds (default: 100)
  --watch           Watch the AI play in the terminal (ASCII)
```

**Serve the browser game:**

```
bin/serve [options]
  --port N          Server port (default: 8080)
```

Once a model is trained and the server is running, click "AI Play" in the
browser to watch the trained agent play.
