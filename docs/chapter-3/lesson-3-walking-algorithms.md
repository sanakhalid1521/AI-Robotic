---
sidebar_label: 'Lesson 3: Walking Algorithms'
title: 'Lesson 3: Walking Algorithms'
---

# Walking Algorithms

Walking algorithms for humanoid robots are complex systems that must coordinate multiple joints while maintaining balance and achieving forward motion. These algorithms have evolved significantly over the years to become more stable and human-like.

## Classic Walking Approaches

### Precomputed Trajectories
- Walking patterns are planned in advance
- Stable but not adaptable to disturbances
- Good for controlled environments

### Online Pattern Generation
- Walking patterns generated in real-time
- Can adapt to disturbances and terrain changes
- Requires significant computational resources

## Key Walking Algorithms

### ZMP-Based Walking
- Maintains the Zero-Moment Point within the support polygon
- Very stable but can be slow and energy-intensive
- Foundation for many humanoid walking controllers

### Capture Point-Based Walking
- Uses capture point to determine where to step
- More dynamic and efficient than pure ZMP
- Allows for more natural walking patterns

### Divergent Component of Motion (DCM)
- Uses DCM to plan stable footsteps
- Enables more dynamic and efficient walking
- Modern approach used in advanced humanoid robots

## Walking Phases and Coordination

### Footstep Planning
- Determining where to place each foot
- Must account for balance and stability
- Considerations for terrain and obstacles

### Joint Trajectory Generation
- Creating smooth trajectories for all joints
- Coordinating arms for balance
- Maintaining upright posture

### Real-Time Adjustments
- Correcting for disturbances during walking
- Adjusting step timing and placement
- Maintaining balance during transitions

## Hands-On Activity

Analyze the walking pattern of a person walking at different speeds. Notice how the step length, step width, and center of mass movement change. Consider how these observations could inform the design of a walking algorithm for a humanoid robot. Create a simple model showing how step length might be adjusted based on desired walking speed while maintaining stability.

import SummaryButton from '@site/src/components/SummaryButton';

<SummaryButton
  title="Lesson 3 Summary: Walking Algorithms"
  content="Walking algorithms for humanoid robots must coordinate multiple joints while maintaining balance and achieving forward motion. Key approaches include precomputed trajectories and online pattern generation. Important algorithms include ZMP-based walking, Capture Point-based walking, and Divergent Component of Motion (DCM). Walking involves footstep planning, joint trajectory generation, and real-time adjustments. This lesson covered the fundamental concepts of humanoid robot walking algorithms and their implementation."
/>