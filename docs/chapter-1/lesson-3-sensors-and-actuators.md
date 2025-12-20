---
sidebar_label: 'Lesson 3: Sensors and Actuators'
title: 'Lesson 3: Sensors and Actuators'
---

# Sensors and Actuators

Sensors and actuators form the interface between a robot and its environment. Sensors provide input about the world, while actuators provide the ability to act upon it.

## Types of Sensors

### Proprioceptive Sensors
- Encoders: Measure joint angles
- Force/torque sensors: Measure forces applied to the robot
- Inertial measurement units (IMUs): Measure acceleration and rotation

### Exteroceptive Sensors
- Cameras: Visual information
- LIDAR: Distance measurements using light
- Ultrasonic sensors: Distance measurements using sound
- Tactile sensors: Touch and pressure information

## Types of Actuators

### Electric Actuators
- Servo motors: Precise position control
- Stepper motors: Discrete position control
- DC motors: Continuous rotation with variable speed

### Other Actuators
- Hydraulic: High force, precise control
- Pneumatic: Fast response, clean operation

## Hands-On Activity

Research and compare the specifications of different actuators for a humanoid robot's knee joint. Consider factors like:
- Torque requirements
- Speed capabilities
- Power consumption
- Size and weight constraints

Create a simple table comparing at least 3 different actuator options for the knee joint, including their pros and cons for humanoid applications.

import SummaryButton from '@site/src/components/SummaryButton';

<SummaryButton
  title="Lesson 3 Summary: Sensors and Actuators"
  content="Sensors and actuators form the interface between a robot and its environment. Sensors provide input about the world, including proprioceptive sensors (encoders, force/torque sensors, IMUs) and exteroceptive sensors (cameras, LIDAR, ultrasonic, tactile). Actuators provide the ability to act upon the environment and include electric actuators (servo, stepper, DC motors) and other types (hydraulic, pneumatic). This lesson covered the fundamental sensor and actuator types essential for robotic systems."
/>