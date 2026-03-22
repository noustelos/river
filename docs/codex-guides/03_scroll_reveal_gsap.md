# Scroll Reveal Animations

Library: - GSAP - ScrollTrigger plugin

## Installation

``` html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
```

## Animation Example

``` javascript
gsap.from(".reveal",{
opacity:0,
y:60,
duration:1,
scrollTrigger:{
trigger:".reveal",
start:"top 80%"
}
})
```

## Base CSS

``` css
.reveal{
opacity:0;
transform:translateY(60px);
}
```
