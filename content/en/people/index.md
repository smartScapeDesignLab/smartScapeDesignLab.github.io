---
title: People

type: landing

sections:
  - block: people
    content:
      title: People
      # Choose which groups/teams of users to display.
      #   Edit `user_groups` in each user's profile to add them to one or more of these groups.
      user_groups:
        - Principal Investigator
        - Research fellow
        - PhD Student
        - Visiting PhD
        - Research Assistant
        - Alumni

      # sort_by: Params.last_name
      sort_by: Params.order_weight # 按此数字升序排列
      sort_ascending: true
    design:
      show_interests: false
      show_role: true
      show_social: true
---
