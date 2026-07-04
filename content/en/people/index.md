---
title: People

type: landing

sections:
  - block: people
    content:
      title: People
      user_groups:
        - Members
      # sort_by: Params.last_name
      sort_by: Params.order_weight # 按此数字升序排列
      sort_ascending: true
    design:
      show_interests: false
      show_role: true
      show_social: true

  - block: people
    content:
      title: Alumni
      user_groups:
        - Alumni
      sort_by: Params.order_weight
      sort_ascending: true
    design:
      show_interests: false
      show_role: true
      show_social: true
---
