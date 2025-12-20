---
sidebar_label: 'Lesson 1: Locomotion Principles'
title: 'Lesson 1: Locomotion Principles'
---

# Locomotion Principles

Locomotion is the ability to move from one place to another. For humanoid robots, locomotion is particularly challenging because they must maintain balance while moving in a human-like manner.

## Types of Locomotion

### Static Locomotion
- Moves slowly with stable support at all times
- Center of mass remains within support polygon
- Very stable but slow

### Dynamic Locomotion
- Uses dynamic balance and momentum
- Can be faster but requires precise control
- Similar to human walking patterns

## Key Concepts

### Zero-Moment Point (ZMP)
A crucial concept in bipedal locomotion. The ZMP is the point on the ground where the sum of all moments of the active forces equals zero. For stable walking, the ZMP must remain within the support polygon.

### Support Polygon
The area defined by the contact points with the ground. For a humanoid robot, this changes as feet move during walking.

### Gait Phases
- Single support: One foot on ground
- Double support: Both feet on ground
- Swing phase: Foot moving through air

## Biomechanics of Walking

Human walking involves complex coordination of muscles, joints, and balance systems. Humanoid robots attempt to replicate these patterns while accounting for their mechanical differences.

## Hands-On Activity

Research the difference between walking and running in terms of support phases. Calculate how the support polygon changes during different phases of human walking by observing your own gait or video analysis. Note how the center of mass moves relative to the support polygon during walking.

import SummaryButton from '@site/src/components/SummaryButton';

<SummaryButton
  title="Lesson 1 Summary: Locomotion Principles"
  content="Locomotion for humanoid robots involves the challenging task of maintaining balance while moving in a human-like manner. Key concepts include static locomotion (stable but slow) and dynamic locomotion (faster with precise control). Important principles include the Zero-Moment Point (ZMP), support polygon, and gait phases (single support, double support, swing phase). This lesson covered the biomechanics of walking and the fundamental principles of bipedal locomotion for humanoid robots."
/>