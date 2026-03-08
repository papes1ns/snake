# AI Snake: How It Learns (ELI5)

This document walks through how the snake learns to play itself — no human
labels, no training data, no supervision. Just evolution.

---

## Table of Contents

1. [The Big Idea](#the-big-idea)
2. [The Neural Network (The Brain)](#the-neural-network-the-brain)
3. [Forward Propagation — How the Brain Thinks](#forward-propagation--how-the-brain-thinks)
4. [The Genetic Algorithm (Natural Selection)](#the-genetic-algorithm-natural-selection)
5. [Game Changes Required for Training](#game-changes-required-for-training)
6. [Alternative Approaches](#alternative-approaches)

---

## The Big Idea

Imagine you have 1,000 babies who have never seen a snake game before. You give
each one a controller and let them play. Most will crash into a wall immediately.
A few, by pure luck, will stumble toward the food and score a point. You take the
best players, let them "have kids," scramble their brains a tiny bit, and repeat.
After hundreds of generations the population gets genuinely good — without anyone
ever *teaching* them the rules.

That is **neuroevolution**: evolving neural networks with a genetic algorithm.

There is no gradient descent, no backpropagation, no labeled dataset. The only
feedback signal is a **fitness score** computed after each game.

---

## The Neural Network (The Brain)

Each snake is controlled by a small feedforward neural network.

### Architecture

```
Layer 0 (Input)  :  24 neurons   ← what the snake sees
Layer 1 (Hidden) :  18 neurons   ← pattern detection
Layer 2 (Hidden) :  18 neurons   ← higher-level reasoning
Layer 3 (Output) :   4 neurons   ← one per direction (N, E, S, W)
```

The shape is stored as the array `[24, 18, 18, 4]`.

### What the 24 Inputs Are

The snake casts 8 rays outward from its head (N, NE, E, SE, S, SW, W, NW).
Each ray reports 3 values:

| Value | Meaning |
|-------|---------|
| `1 / distance` | How close is the wall in this direction (1.0 = right next to it) |
| `foodFound` | 1 if food is along this ray, 0 otherwise |
| `bodyFound` | 1 if the snake's own body is along this ray, 0 otherwise |

8 rays × 3 values = **24 inputs**.

### Data Structures — Weights and Biases

Between every pair of adjacent layers there is a **weight matrix** and a
**bias vector**:

```
Connection       Weight matrix shape     Bias vector shape
───────────────  ──────────────────────  ─────────────────
Input → Hidden1  18 rows × 24 cols       18 × 1
Hidden1 → Hidden2  18 rows × 18 cols     18 × 1
Hidden2 → Output  4 rows × 18 cols        4 × 1
```

**Total parameters** (the "DNA" of one snake):

```
Weights: (18×24) + (18×18) + (4×18) = 432 + 324 + 72 = 828
Biases:  18 + 18 + 4                                   =  40
                                                 Total  = 868
```

These 868 numbers are everything that makes one snake different from another.
When we save a model to `best.json`, we flatten all 868 values into a single
array.

### What Weights and Biases Actually Do

Think of each neuron as a tiny voting machine:

- **Weights** decide *how much each input matters*. A large positive weight
  means "this input strongly pushes my vote up." A large negative weight means
  "this input pushes my vote down." A weight near zero means "I ignore this
  input."
- **Biases** set the *default mood* of the neuron before it looks at any input.
  A positive bias means the neuron is "optimistic" — it starts leaning toward
  firing. A negative bias means it needs stronger input to activate.

Together they form a linear equation for each neuron:

```
z = b + w₁·x₁ + w₂·x₂ + ... + wₙ·xₙ
```

Then an activation function decides whether the neuron fires.

---

## Forward Propagation — How the Brain Thinks

Every game tick the snake runs one forward pass through the network. Here is the
math for a single neuron `j` in layer `l`:

### Step 1 — Weighted Sum

```
zⱼ = bⱼ + Σ (wⱼₖ · aₖ)      for all k in previous layer
```

In matrix form for an entire layer:

```
z = W · a + b

where:
  W  = weight matrix  (rows × cols = neurons_out × neurons_in)
  a  = activation vector from the previous layer  (neurons_in × 1)
  b  = bias vector  (neurons_out × 1)
  z  = pre-activation output  (neurons_out × 1)
```

### Step 2 — Activation (ReLU)

For hidden layers we apply **ReLU** (Rectified Linear Unit):

```
aⱼ = max(0, zⱼ)
```

This is dead simple: if the weighted sum is negative, output 0. Otherwise pass
it through unchanged. It lets the network learn non-linear patterns (like "food
is to my left AND a wall is ahead → turn left") that a pure linear function
could never represent.

The **output layer skips ReLU** — it outputs raw scores. The highest score wins
and becomes the snake's chosen direction.

### Full Forward Pass (Concrete Numbers)

```
inputs (24×1)
    │
    ▼
 W₁ (18×24) · inputs + b₁ (18×1) → ReLU → h₁ (18×1)
    │
    ▼
 W₂ (18×18) · h₁ + b₂ (18×1) → ReLU → h₂ (18×1)
    │
    ▼
 W₃ (4×18) · h₂ + b₃ (4×1) → raw scores (4×1)
    │
    ▼
 argmax → direction index (0=N, 1=E, 2=S, 3=W)
```

The code for this lives in `NeuralNet.prototype.forward` (`src/neural_net.js`).

---

## The Genetic Algorithm (Natural Selection)

This is where "unsupervised learning" happens. There are no labels and no
teacher. The algorithm is:

```
1.  Create 1,000 random neural nets           (random weights & biases)
2.  Let each one play 8 games of snake         (evaluate)
3.  Score them with a fitness function          (rank)
4.  Keep the top 5% unchanged                  (elitism)
5.  For the remaining 95%:
      a. Pick two parents via tournament        (selection)
      b. Splice their DNA together              (crossover)
      c. Randomly tweak some genes              (mutation)
6.  The new population replaces the old one
7.  Go to step 2
```

### Fitness Function

```
fitness(score, steps) = score² × 5000 + steps
```

| Term | Why |
|------|-----|
| `score²` | Quadratic reward makes each additional food worth more than the last. Scoring 5 is worth 5× more than scoring 1. |
| `× 5000` | Scaling factor so that even 1 food (5000) vastly outweighs survival alone. |
| `+ steps` | Tie-breaker: among snakes that score 0, the one that survives longest wins. This bootstraps early generations where nobody can find food yet. |

### Tournament Selection

To pick a parent we don't just take the global best (that would reduce diversity
too fast). Instead we randomly sample 5 individuals and pick the best among
them. This gives good snakes a *higher probability* of being chosen while still
allowing weaker ones a chance.

```
function select(results):
    best = null
    repeat 5 times:
        pick a random individual
        if it's better than best → best = this individual
    return best
```

### Crossover — Parent1 + Parent2

This is the "reproduction" step. Two parent networks combine their 868 flat
weights to create a child:

```
Parent1 weights:  [0.2, -0.5,  0.8,  1.1, -0.3,  0.4, ...]
Parent2 weights:  [0.7,  0.1, -0.2,  0.3,  0.9, -0.6, ...]
                         ↑ crossover point (random)
Child weights:    [0.2, -0.5,  0.8, | 0.3,  0.9, -0.6, ...]
                   ← from parent1 → | ← from parent2 ────→
```

A single random **crossover point** is chosen. Everything before it comes from
parent1, everything after from parent2. This is called **single-point
crossover**.

The child inherits a mix of both parents' "intuitions" — maybe parent1 was
great at avoiding walls and parent2 was great at chasing food. The child might
get both skills.

### Mutation

After crossover, each of the child's 868 weight values has a 5% chance of being
randomly nudged:

```
if random() < 0.05:
    weight += gaussian_noise × 0.3
```

The Gaussian noise is generated with the Box-Muller transform:

```
gaussian = √(-2 · ln(u)) · cos(2π · v)     where u,v ∈ (0,1)
```

Mutation prevents the population from getting stuck. Even if all parents are
similar, mutation introduces fresh genetic material — the occasional lucky
mutation that discovers a new strategy.

### Elitism

The top 5% of the population (50 out of 1,000) are copied directly into the
next generation without crossover or mutation. This guarantees that the best
solution found so far is never lost.

### Why This Is "Unsupervised"

Traditional supervised learning needs labeled examples: "given this game state,
the correct move is East." We have no such labels. The genetic algorithm only
knows **how well each network performed overall** (the fitness score). It never
tells the network *which specific move was good or bad*. Evolution figures it out
through trial, error, and selection pressure across thousands of generations.

---

## Game Changes Required for Training

The original snake game was a browser-only app with DOM rendering. Several
changes were needed to make AI training possible:

### 1. Headless Game Engine (`src/headless_game.js`)

Training requires playing millions of games as fast as possible. The browser
game renders every frame to the DOM — far too slow. The headless engine is a
pure-JavaScript reimplementation of the same game rules with zero DOM
dependencies. It runs ~10,000× faster than the visual game.

### 2. 8-Directional Raycasting Vision (`getVision()`)

The snake needs a way to perceive the board. Raw board state (900 cells) would
be too large an input space. Instead, 8 directional rays compress the entire
board into 24 meaningful numbers that capture wall proximity, food direction,
and body danger.

### 3. Dynamic Speed Curve (Arcade Bit-Shift)

The game speeds up as the score increases:

```
interval = max(BASE_INTERVAL >> (score >> DIVISOR), MIN_INTERVAL)
```

With `BASE_INTERVAL=150ms`, `DIVISOR=4`, `MIN_INTERVAL=20ms`:

| Score | Shift | Interval |
|-------|-------|----------|
| 0–15  | 0     | 150ms    |
| 16–31 | 1     | 75ms     |
| 32–47 | 2     | 37ms     |
| 48+   | 3     | 20ms (floor) |

This matters for training because game time is measured in simulated
milliseconds. Higher scores mean faster ticks, meaning more moves per game —
rewarding snakes that can handle increasing pressure.

### 4. Time Limit (100 seconds simulated)

Without a time limit, a snake that learned to loop forever would survive
indefinitely and accumulate a huge step count. The 100-second cap forces
evolution to favor snakes that **score quickly** rather than merely surviving.

### 5. Starvation Mechanic (Hunger)

Even with a time limit, a snake can waste time looping in circles without dying.
The hunger system kills the snake if it goes too long without eating:

```
hungerLimit = 120 + snakeLength × 3
```

A length-1 snake gets ~123 ticks to find food. A length-20 snake gets ~180.
This scales because longer snakes need more room to maneuver around their own
body. The old flat threshold of 900 ticks was far too generous — it allowed
degenerate edge-following strategies to survive.

### 6. Randomized Starting Conditions

The snake spawns at a random position (with a 3-cell margin from walls) facing
a random direction. Without this, the AI would overfit to a single starting
scenario and fail when placed anywhere else.

### 7. Multi-Game Evaluation

Each network plays 8 games per generation, and fitness is averaged. This reduces
the influence of lucky/unlucky food placements and produces more stable fitness
rankings.

### 8. Parallel Training (`src/worker.js`)

Later generations take longer because better snakes survive longer games.
Training distributes the population across 15 worker processes. Each worker
evaluates its slice independently and reports fitness back to the master
process. The genetic algorithm (selection, crossover, mutation) runs on the
master.

This works because **evaluation is embarrassingly parallel** — each game is
independent. The only synchronization point is between generations when the
master needs all fitness scores before evolving the next population.

---

## Alternative Approaches

The genetic algorithm works but it's not the only option. Here's how other
algorithms compare for this specific problem:

### Deep Q-Network (DQN)

| Aspect | Genetic Algorithm | DQN |
|--------|-------------------|-----|
| Learning signal | Fitness after full game | Reward every single step |
| Credit assignment | Implicit (evolution) | Explicit (temporal difference) |
| Sample efficiency | Low (millions of games) | Higher (learns from each step) |
| Hyperparameter sensitivity | Low | High (learning rate, epsilon, replay buffer) |
| Parallelism | Trivial | Possible but complex |
| Implementation complexity | Simple | Moderate |

DQN learns a Q-function Q(state, action) that predicts future reward. It uses
**experience replay** (storing past transitions) and a **target network** to
stabilize training. For snake, DQN would likely converge faster because it gets
feedback on *every move* rather than waiting for a full game to finish. However,
it requires careful tuning and is harder to parallelize.

### NEAT (NeuroEvolution of Augmenting Topologies)

NEAT is an advanced genetic algorithm that evolves not just the weights but also
the **network structure itself** — adding neurons and connections over time. It
starts with minimal networks and grows complexity only when needed.

For snake, NEAT could discover that the problem needs fewer (or more) hidden
neurons than our fixed `[24, 18, 18, 4]` architecture. The downside is
significantly more implementation complexity and slower evolution due to
speciation overhead.

### PPO (Proximal Policy Optimization)

PPO is a modern policy-gradient method used by OpenAI for complex tasks. It
directly optimizes the policy (the mapping from state to action probabilities)
using gradient ascent on expected reward, with a clipping mechanism to prevent
destructively large updates.

For snake, PPO would be the most sample-efficient option and would produce the
best results given enough tuning. But it requires automatic differentiation
(a framework like TensorFlow or PyTorch), making it impractical in plain
vanilla JavaScript without a tensor library.

### Why Genetic Algorithm Was Chosen

For this project, the genetic algorithm hits the sweet spot:

- **Zero dependencies** — runs in plain Node.js, no ML frameworks needed
- **Trivially parallel** — just fork workers, no gradient synchronization
- **Simple to implement** — ~170 lines of code for the entire algorithm
- **Robust** — few hyperparameters, hard to break with bad settings
- **Educational** — the concepts (selection, crossover, mutation) map directly
  to biology and are easy to reason about

The tradeoff is speed of convergence. A DQN or PPO agent would likely reach
the same skill level in fewer total game steps. But for a browser-based snake
game, the genetic algorithm produces surprisingly competent players in a
reasonable number of generations.
