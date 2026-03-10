# The Rat Pit: A Real-World Metaphor for Neuroevolution

How 1,000 digital rats learned to play snake — explained through the lens of
New York City's most ruthless survivors.

---

## Table of Contents

1. [The Rat Pit (Setting the Scene)](#1-the-rat-pit)
2. [What Makes a Rat Smart (The Brain)](#2-what-makes-a-rat-smart)
3. [The Pit Cycle (Generation by Generation)](#3-the-pit-cycle)
4. [Why the Strongest Rat Wins (Selection Pressure)](#4-why-the-strongest-rat-wins)
5. [The Rat King vs. Other Strategies](#5-the-rat-king-vs-other-strategies)
6. [Sources](#sources)

---

## 1. The Rat Pit

### The Historical Pit

In the 1850s, an Irish-American gang leader named Kit Burns ran a saloon called
Sportsmen's Hall on Water Street in the Bowery. The first floor was arranged as
an amphitheater with rough wooden benches around a fenced ring. Into that ring,
Burns would release dozens of large gray wharf rats captured from the city's
docks. Dogs were set loose on them. Spectators bet on outcomes. The rats that
lasted longest were the ones that fought hardest, hid smartest, or were simply
born a little faster than the rest. It was ugly, but the underlying principle
was pure: **put a population under extreme pressure and the survivors carry
traits the others didn't.**

Burns' pit closed in 1870, but the city's rats never stopped competing.

### The Modern Pit

Fast-forward to March 2020. COVID-19 lockdowns shut down restaurants across
New York overnight. For generations, the city's two million brown rats had
built their entire existence around restaurant garbage — predictable, abundant,
reliable. Then it vanished.

The CDC issued a warning about "unusual or aggressive rodent behavior." Urban
rodentologist Bobby Corrigan described what happened next: hungry rats simply
turned on each other. Strong males raided neighboring nests, killing mothers
and pups. Cannibalism and infanticide became survival strategies. In Queens,
sidewalks were reportedly covered in rat limbs — the aftermath of colony wars
over scraps.

But here's the part that matters: **the rats that survived this crucible were
not average rats.** They were smarter foragers, more aggressive competitors,
and faster decision-makers. They bred. Their pups inherited those advantages.
Within months, pest control workers noticed that the surviving population was
measurably more resilient and harder to trap than before.

No one taught these rats to be better. No scientist rewarded them with cheese
for making correct turns. The environment itself — starvation, competition,
death — filtered the population until only the strongest traits remained.

**That is exactly how the snake AI learns.**

### The Mapping

| The Rat Pit | The Snake AI |
|-------------|-------------|
| New York City streets and sewers | The 30x30 game board |
| 1,000 rats competing for food | 1,000 neural networks playing snake |
| Food scarcity and starvation | The hunger mechanic — eat within 120 + (length x 3) ticks or die |
| The strongest rats that survive the winter | The elite 5% carried unchanged to the next generation |
| Survivors breeding in the spring | Crossover — two parent networks splice their DNA into a child |
| Random mutations from environmental stress | 5% of the child's genes randomly tweaked with Gaussian noise |
| Repeating the cycle, season after season | Running the genetic algorithm for hundreds of generations |

No human ever tells a rat which alley to take. No programmer ever tells a
neural network which direction to move. The only feedback is survival.

---

## 2. What Makes a Rat Smart

### Whiskers and Instinct

A real rat navigates the world through its whiskers. Each whisker is a sensor
that fires electrical signals back to the brain: *wall close on the left, open
space ahead, something warm and edible to the right, another rat's body
blocking the path behind.* The rat doesn't consciously think "I should turn
right." Its brain — shaped by millions of years of evolution — takes those
sensory signals, runs them through layers of neurons, and produces an instant
gut reaction. Turn right. Now.

The snake AI works the same way.

### Eight Whiskers, Three Signals Each

The snake casts eight invisible rays outward from its head — one in each
compass direction (N, NE, E, SE, S, SW, W, NW). Think of them as eight long
whiskers probing the darkness. Each whisker reports three things:

| Signal | Rat Equivalent | What It Means |
|--------|---------------|---------------|
| Wall distance | Whisker bends against a hard surface | How close is the wall? (1.0 = right next to it) |
| Food visible | Nose detects something edible | Is there food along this line? (yes/no) |
| Body visible | Whisker touches another rat (or itself) | Is the snake's own body in the way? (yes/no) |

Eight whiskers times three signals = **24 inputs**. That's everything the snake
knows about the world. No memory of where it's been. No map. No plan. Just 24
numbers, right now, this instant.

### The Rat Brain

Those 24 signals feed into a small brain — a feedforward neural network with
four layers:

```
24 sensory inputs (the whiskers)
       |
   18 neurons (pattern detection — "wall AND food means turn")
       |
   18 neurons (higher reasoning — "I'm boxed in, find an exit")
       |
    4 outputs (gut reaction: North, East, South, or West)
```

The highest output wins. If the "East" neuron fires strongest, the snake turns
east. No deliberation, no second-guessing. Pure instinct, just like a rat.

### Born Instincts: Weights and Biases

What makes one rat bolder than another? What makes one snake turn left where
another turns right, given the exact same sensory input?

**Weights and biases.** These are the 868 numbers that define a single snake's
personality — its DNA.

- **Weights** are the strength of connections between neurons. A large positive
  weight on the "food visible to the east" input means this snake is
  food-obsessed — it lunges toward anything edible. A large negative weight on
  "wall close to the north" means it flinches away from walls. A weight near
  zero means it ignores that signal entirely.

- **Biases** are the default mood of each neuron. A positive bias means the
  neuron is eager to fire, like a jumpy rat that bolts at the slightest
  stimulus. A negative bias means it takes a strong signal to activate, like a
  calm rat that holds its ground.

Some rats are born cautious. Some are born reckless. Some have a preternatural
sense for where food is. These aren't learned behaviors — they're inherited.
And in the pit, the ones with the wrong instincts die before they can breed.

---

## 3. The Pit Cycle

Here is one full generation of evolution, told as a story.

### Round 1 — The Drop

One thousand rats are born. Every single one has a brain wired with random
connections — 868 numbers pulled from a dice roll. Most of these brains are
garbage. They'll send the rat straight into a wall on the first move. A few,
by sheer statistical luck, will have weights that happen to flinch away from
walls or lean toward food.

Nobody chose these traits. Nobody designed them. They're random.

### Round 2 — The Pit

Each rat is dropped into the pit eight separate times. Different starting
positions, different food placements. Eight trials, because you don't judge a
rat by one lucky run — you judge it by consistency.

In the first generation, most rats die within 5 moves. They walk straight into
walls. A few last 20 or 30 moves, bouncing randomly off walls by accident. One
or two — out of a thousand — stumble into a piece of food purely by chance.

### Round 3 — The Judgement

After all eight trials, each rat receives a fitness score:

```
fitness = score^2 x 5000 + steps survived
```

A rat that ate nothing but survived 50 steps scores 50. A rat that ate one
piece of food and survived 30 steps scores 5,030. A rat that ate three pieces
of food and survived 100 steps scores 45,100.

The scoring is deliberately quadratic — each additional piece of food is worth
*exponentially* more than the last. This is like saying: a rat that can find
food once might be lucky. A rat that finds food three times is genuinely
skilled. Reward skill disproportionately.

The survival term (steps) is the tiebreaker. Among rats that never find food,
the one that stays alive longest wins — because at least it learned to avoid
walls, and that's a trait worth preserving.

All 1,000 rats are ranked from best to worst.

### Round 4 — The Elite Survive

The top 50 rats (5%) are copied directly into the next generation. No changes.
No breeding. Their DNA is preserved exactly as it is.

This is **elitism**. In the real world, it's the dominant alpha rat whose
territory is so well-established that no challenger can displace it. It doesn't
need to adapt — it's already the best. You don't mess with what works.

### Round 5 — Breeding

The remaining 950 slots are filled by breeding. To pick each parent:

1. Grab five random rats from the population
2. The best of those five becomes a parent

This is **tournament selection**. It's not a strict meritocracy — the #1 rat
doesn't father every child. A mediocre rat that happens to be the best in its
random group of five still gets to breed. This preserves genetic diversity, just
like in real rat colonies where subordinate males still mate opportunistically.

Two parents are chosen this way. Their DNA is combined:

```
Parent 1 (the wall-avoider):  [0.2, -0.5,  0.8,  1.1, -0.3,  0.4, ...]
Parent 2 (the food-chaser):   [0.7,  0.1, -0.2,  0.3,  0.9, -0.6, ...]
                                            ^ random cut point
Child:                        [0.2, -0.5,  0.8,  0.3,  0.9, -0.6, ...]
                               <-- from parent 1 | from parent 2 -->
```

Everything before the cut comes from parent 1. Everything after comes from
parent 2. The child inherits the wall-avoidance instincts of one parent and
the food-chasing instincts of the other. Maybe it gets the best of both worlds.
Maybe it gets the worst. That's the gamble.

### Round 6 — Mutation

After breeding, 5% of the child's 868 genes are randomly nudged — a small
Gaussian jitter, like cosmic radiation hitting a strand of DNA. Most mutations
are neutral or harmful. But occasionally, a mutation creates a connection that
neither parent had — a new instinct that happens to work brilliantly.

In the real world, this is how antibiotic-resistant bacteria appear. One random
mutation in a population of billions makes one bacterium immune. That one
survives and breeds. In the rat pit, one random weight change might make a
snake notice food two squares away instead of three. That's enough to win.

### Round 7 — Repeat

The 1,000 new rats — 50 elites and 950 children — enter the pit. Generation 2
begins. Then generation 3. Then 100. Then 500.

By generation 50, the average rat survives 10x longer than generation 1.
By generation 200, most rats can reliably find food.
By generation 500, the best rats chain together long sequences of food
consumption, dodging their own growing body with reflexes that no human
designed.

No one taught them. The pit taught them.

---

## 4. Why the Strongest Rat Wins

Three forces in the pit ensure that only genuinely skilled rats survive. Each
one mirrors a real-world pressure that NYC rats face.

### The Clock (Time Limit — 300 seconds)

Winter is coming. A rat can't forage forever. In the game, each snake has 300
simulated seconds to score as high as possible. A rat that plays it safe —
circling the edges, avoiding risk — might survive the full five minutes but
score only 2 or 3 points. A rat that hunts aggressively scores 15+ and gets
a fitness score 50x higher.

This is the same pressure that drives real rats to take risks during harsh
winters. The cautious rat that stays in the nest and rations its food might
survive, but the bold rat that raids a new garbage bin and finds a feast will
outbreed it come spring.

### The Hunger (Starvation Mechanic)

During the COVID lockdowns, rats that couldn't find new food sources within
days began cannibalizing their own colonies. There was no grace period. Adapt
or starve.

The snake has the same rule. If it goes more than `120 + (body length x 3)`
ticks without eating, it dies. A short snake (length 1) gets about 123 moves to
find food. A long snake (length 20) gets 180 — more slack, because navigating
around a longer body is genuinely harder.

This mechanic specifically kills the degenerate strategy of "just loop in
circles forever." A rat that runs the perimeter of the pit without eating
is not surviving — it's stalling. The hunger clock ensures it pays for that.

### The Speed Ramp (Bit-Shift Acceleration)

The game gets faster as the score increases. At score 0, the snake moves at
10 nodes per second. By score 24, it's moving at 83 nodes per second. By score
32, it's at 100 — ten times faster than it started.

This mirrors how a growing rat colony faces escalating pressure. When a colony
is small, food is abundant relative to mouths. As the colony grows, competition
intensifies exponentially. The rats that thrive at low population density aren't
necessarily the ones that thrive under intense competition. The speed ramp
ensures that a snake good enough to score 30 must also have the reflexes to
survive at high speed — a fundamentally different skill than scoring 5.

---

## 5. The Rat King vs. Other Strategies

### The Rat King (Overfitting)

A rat king is a rare, grotesque phenomenon where multiple rats become
permanently entangled at their tails — bound together by blood, feces, and
nesting material into a single helpless mass. They can't move independently.
They can't forage. They starve together.

In neuroevolution, the equivalent is **overfitting**: when the entire population
converges on the same strategy. Every rat becomes identical. They all follow the
same path, exploit the same pattern, fail at the same obstacle. When the
environment changes — a new starting position, an unlucky food placement — they
all fail simultaneously, just like tangled rats that can't adapt to any
situation individually.

The snake AI prevents this with three countermeasures:

- **Randomized starting positions** — no two games are identical
- **Tournament selection** — weaker rats still get chances to breed, preserving
  diversity
- **Mutation** — even clones of the best rat will diverge over generations

### The Lab Rat (Deep Q-Networks)

Instead of dropping 1,000 rats in a pit, imagine taking a single rat and
placing it in a maze. Every time it turns the right way, you give it a pellet.
Every time it hits a wall, you give it a mild shock. Over thousands of trials,
the rat learns the optimal path — not through evolution, but through personal
experience and reinforcement.

This is **Deep Q-Learning (DQN)**. A single neural network learns by getting
feedback on *every single move*, not just the final score. It's dramatically
more sample-efficient — the rat learns from each step instead of waiting for
the entire maze run to finish. But it requires careful calibration of rewards,
and it's much harder to parallelize (you can't easily run 1,000 independent
lab experiments simultaneously).

For snake, DQN would converge faster. But it demands a reward-engineering
effort (how much reward for each food? how much punishment for dying? what
about intermediate moves?) that the genetic algorithm sidesteps entirely. In
the pit, the only question is: did you survive? The simplicity is the point.

### The Engineered Rat (NEAT)

What if you didn't just breed rats for better instincts, but actually
redesigned their nervous systems? Gave some rats extra neurons. Removed
unnecessary connections. Let evolution decide not just the *strength* of each
brain connection but the *architecture* of the brain itself.

This is **NEAT** (NeuroEvolution of Augmenting Topologies). It starts with the
simplest possible brain — maybe just a direct connection from whisker to
muscle — and gradually adds complexity only when the problem demands it. It's
the most powerful neuroevolution approach, and it can discover network
architectures that no human would design.

The cost is complexity and speed. NEAT must track species, protect innovation
through speciation, and manage a growing genome. For a snake game in vanilla
JavaScript with no ML framework, it's overkill. The fixed-architecture genetic
algorithm achieves good results with 170 lines of code and zero dependencies.

### Why the Pit Wins (For This Problem)

The rat pit — the basic genetic algorithm — is chosen here for the same reason
NYC rats dominate: **simplicity, adaptability, and brute-force resilience.**
NYC rats didn't evolve through careful laboratory breeding programs. They
evolved through relentless environmental pressure applied to enormous
populations over short generations. The genetic algorithm does the same thing:
throw enough random brains at the problem, kill the failures, breed the
survivors, and repeat until intelligence emerges from chaos.

No frameworks. No labeled data. No gradient calculations. Just a pit, a
thousand rats, and time.

---

## Sources

1. **Kit Burns and Sportsmen's Hall** — [Wikipedia: Kit Burns](https://en.wikipedia.org/wiki/Kit_Burns)
2. **Rat-baiting history** — [Wikipedia: Rat-baiting](https://en.wikipedia.org/wiki/Rat-baiting)
3. **NYC rat pits and the Bowery** — [Victoria Flexner: NYC Icons: The Rat](https://victoriaflexner.substack.com/p/nyc-icons-the-rat)
4. **COVID-19 rat cannibalism and aggression** — [Business Insider: Hungry rats may turn to cannibalism](https://www.businessinsider.com/rats-could-get-more-aggressive-coronavirus-pandemic-2020-4)
5. **CDC warning on aggressive rodent behavior** — [New York Times: C.D.C. Warns of Aggressive Rats](https://www.nytimes.com/2020/05/24/us/cdc-coronavirus-rats.html)
6. **Pandemic effects on urban rats** — [The Atlantic: Cities Have Changed — For Rats](https://www.theatlantic.com/science/archive/2020/06/pandemic-rats-urban-wildlife/612775/)
7. **Genetic adaptation in NYC rats** — [bioRxiv: Genetic Adaptation in New York City Rats](https://www.biorxiv.org/content/10.1101/2020.02.07.938969v1.full)
8. **Rat king phenomenon** — [Wikipedia: Rat king](https://en.wikipedia.org/wiki/Rat_king)
9. **Rat king biology** — [National Geographic: Rat kings might actually be real](https://nationalgeographic.com/animals/article/rat-king-real-science)
10. **Genetic algorithms and natural selection** — [Nature Scitable: Genetic Algorithms: Harnessing Natural Selection](https://www.nature.com/scitable/blog/student-voices/genetic_algorithms/)
11. **NYC rat mitigation progress (2025)** — [New York Times: Gaining Ground in the War on Rats](https://nytimes.com/2025/03/06/nyregion/rat-sightings-trash-new-york.html)
