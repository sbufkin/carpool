# Carpool schedule optimizer

This scheduling tool is for groups of people who want to carpool to and from two central locations but who have inconsistent and varying schedules. It will allow users to specify morning and afternoon departure times, and then will provide carpool schedules that accommodate those times.

For example:
- Person A wants to depart in the morning at 8 AM, and in the evening 5:45. They have a 15-minute margin for their departure time.
- Person B wants to depart in the morning at 8:20, and in the evening at 4:20. They have a 10-minute margin for their departure time.
- Person C wants to depart in the morning at 9 AM, and in the afternoon at 6 PM. They have a 20-minute margin for their departure time.
- Person D wants to depart in the morning at 8:50, and in the afternoon at 4:10. They have a 5-minute margin for their departure time.

The following carpool schedule will accommodate all of these preferences:
- Person A will drive A and B to work at 8:12, and Person D will drive C and D to work at 8:50.
- Person A will drive A and C home at 5:50, and Person D will drive B and D home at 4:12.

The current JavaScript program generates optimal schedules from a list of preferred departure times and margins. The next step is to develop a web interface for collecting information from users and returning schedules.