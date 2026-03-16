# snake

Snake in the browser, plus a small Node-based neuroevolution stack that can
train an AI to play it.

## What is in this repo

- A playable browser version of Snake served from `index.html` and `scripts/`
- A shared game engine in `src/game_core.js`
- A simple feed-forward neural network in `src/neural_net.js`
- A genetic algorithm trainer in `src/genetic.js`
- CLI tools for serving the game, training a model, and evaluating a model

## Requirements

- Node.js 18+ is a safe baseline
- No external npm dependencies are required

## Running the game

Start the local static server:

```bash
node bin/serve
```

The server listens on `http://localhost:8080` by default.

To use a different port:

```bash
node bin/serve --port 3000
```

## Browser controls

- Arrow keys move the snake
- `P` pauses or resumes the game
- `New Game` resets the board
- `AI: ON/OFF` loads `models/best.json` and lets the trained model play
- `Pause` pauses either human play or AI play

## Training the AI

Train a model with the default settings:

```bash
node bin/train
```

Default behavior:

- `100` generations
- `1000` networks in the population
- `8` games per network evaluation
- worker count of `CPU cores - 1`
- model output written to `models/best.json`

Useful options:

```bash
node bin/train --generations 200 --population 500 --games 12 --workers 4 --time 60
```

- `--generations`, `-g`: number of generations
- `--population`, `-p`: population size
- `--games`: games played per network evaluation
- `--workers`: number of worker processes for parallel evaluation
- `--time`, `-t`: per-game time limit in seconds, `0` disables it
- `--output`, `-o`: output path for the best model JSON

Training prints one line per generation with the best score, best fitness,
average fitness, top scores, and elapsed generation time.

## Evaluating a trained model

Run a batch evaluation:

```bash
node bin/eval
```

Useful options:

```bash
node bin/eval --model models/best.json --games 200 --time 60
```

- `--model`, `-m`: model JSON to load
- `--games`, `-n`: number of evaluation games
- `--time`, `-t`: per-game time limit in seconds
- `--watch`, `-w`: render one game as ASCII in the terminal

Example:

```bash
node bin/eval --watch
```

## How the AI works

The AI uses the shared `GameCore` state and chooses one of four directions on
every step.

Its input vector has 30 values:

- 24 ray-cast features from 8 directions around the snake head
- 4 one-hot values for the current heading
- 2 normalized values describing the food position relative to the head

The default neural-network layout is:

```text
[30, 20, 20, 4]
```

The genetic algorithm evolves network weights with:

- elitism
- tournament selection
- one-point crossover
- gaussian mutation

Fitness is based on score and survival length:

```text
score^2 * 5000 + steps
```

## Project structure

```text
bin/         CLI entry points
models/      saved model JSON files
scripts/     browser UI and in-browser AI controls
src/         shared game engine and training code
```

## Notes

- If `models/best.json` does not exist, the browser UI still loads, but AI mode
  will show a message telling you to run training first.
- The game engine includes both hunger and optional time-limit termination, so
  training favors agents that both survive and keep finding food.
