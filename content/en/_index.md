---
# Leave the homepage title empty to use the site title
title:
type: home_index



section_titles:
  research: Research
  publication: Selected Publications
  image: Images
  video: Videos
  contact: Contact
  repos: Codebase

# 实验室介绍
heroBlock:
  block: hero
  content:
    title: About SmartScape 
#   image:
#      filename: research_topic.jpg
    text: |
      The SmartScape Design Lab at the Department of Architecture, National University of Singapore, advances AI-driven built environment design to improve human visual and thermal comfort. Integrating AI, data-driven modeling, and computational design, we reveal how landscape composition and spatial configuration shape human experience and translate these insights into generative, predictive, and adaptive design strategies for climate-resilient and health-supportive environments.



# 图片轮播  
heroSlideBlock:
  block: slider

  content:

    slides:

      - title: "" # desc-title1
        content:  "" # desc1
        align: left
        background:
          image:
            filename: group_slides/s1.png
            filters:
              brightness: 1 # 0.5 #1
          position: right
          color: '#666'  

      - title: "Designing for Human Comfort and Climate Resilience"
        content: ""
        align: left
        background:
          image:
            filename: group_slides/s2.png
            filters:
              brightness: 1
          position: center
          color: '#666'
        cta:
          label: View Projects
          url: /research/

      - title: "Join Us in Shaping Future Environments"
        content: ""
        align: left
        background:
          image:
            filename: group_slides/s3.jpg
            filters:
              brightness: 1
          position: center
          color: '#666'
        cta:
          label: Opportunities
          url: /opportunities/

  design:
    # Slide height is automatic unless you force a specific height (e.g. '400px')
    # height controlled by css
    
    slide_height: '450px'
    
    
    is_fullscreen: false
    # Automatically transition through slides?
    loop: true
    # Duration of transition between slides (in ms)
    interval: 1000
  
  
  


research: 
  title: Projects 
  show_limit: 5
#    

featured_publication: 
  title: Featured Publications
  show_limit: 5
#    
#    

featured_news: 
  title: News & Events
  show_limit: 5
#    

featured_positions: 
  title: Join Us
  show_limit: 5
  contact_email: jinda.qi@nus.edu.sg
#    
 








---  



