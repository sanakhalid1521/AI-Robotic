---
sidebar_label: 'Lesson 2: Balance and Stability'
title: 'Lesson 2: Balance and Stability'
---

# Balance and Stability

Balance is one of the most critical challenges in humanoid robotics. Unlike wheeled or multi-legged robots, bipedal robots have a small support base and must actively maintain their balance through continuous control.

## Balance Control Strategies

### Ankle Strategy
- Small perturbations are corrected primarily through ankle movements
- Maintains the body as a single inverted pendulum
- Most efficient for minor balance adjustments

### Hip Strategy
- Larger perturbations require hip movements
- Creates a double-inverted pendulum model
- More energy-intensive but necessary for larger disturbances

### Stepping Strategy
- When other strategies fail, stepping is used
- Changes the support base to restore balance
- Last resort to prevent falling

## Stability Metrics

### Center of Mass (CoM)
The point where the robot's mass is concentrated. For stability, the CoM projection must remain within the support polygon.

### Capture Point
The point where a robot must step to come to a complete stop. Used in advanced balance control algorithms.

### Angular Momentum
Control of whole-body angular momentum is crucial for maintaining balance during dynamic movements.

## Balance Control Algorithms

### Linear Inverted Pendulum Model (LIPM)
A simplified model that treats the robot as a point mass on a massless leg. Useful for planning stable walking patterns.

### Cart-Table Model
An extension of LIPM that includes both horizontal and vertical center of mass movement.

### Whole-Body Control
Advanced control that considers all degrees of freedom simultaneously for optimal balance.

## Hands-On Activity

Design a simple balance control system for a humanoid robot. Consider how you would detect when the robot is losing balance and what corrective actions could be taken. Create a flowchart showing the decision process for selecting between ankle, hip, and stepping strategies based on the magnitude of the balance disturbance.

import SummaryButton from '@site/src/components/SummaryButton';

<SummaryButton
  title="Lesson 2 Summary: Balance and Stability"
  content="Balance is a critical challenge in humanoid robotics due to the small support base. Balance control strategies include the ankle strategy (for small perturbations), hip strategy (for larger perturbations), and stepping strategy (for major disturbances). Stability metrics include center of mass, capture point, and angular momentum. Control algorithms include Linear Inverted Pendulum Model (LIPM), Cart-Table Model, and Whole-Body Control. This lesson covered the fundamental concepts of balance and stability for humanoid robots."
/>