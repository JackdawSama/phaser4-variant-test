# phaser4-variant-test
---
## The Myth of Sisyphysics
---
#### IMPORTANT ITEMS FOR CONSIDERATION
This is my first time using Phaser 4 or any Phaser game development engine and the very first time I have ever parsed or touched JavaScript. I work a full-time job and I only get to do personal development work during the weekends. To help me with my process of learning and writing code within a new framework and language, given my tight timelines, I used AI(CLAUDE, the web version not CLAUDE CODE) in completing this test. 

I did not have CLAUDE generate ideaas for me or use it for any form of art asset development. I used it purely for helping me write code.Had it been an engine or language I'm more familiar with then I'd have taken the more traditional route of writing code all by myself with only my rubber duck to talk to.

---
### Akshay's Dev Log

I've always known that I'm more of a game designer than a developer but if Design and Development were two ends of a spectrum I'd be sitting somewhere in the middle leaning more towards to the design.

Because of this I definitely didn't want to give up on coming up with something a little non-stadard. I loved the constrait of having a character, a very specific one, because this character now defined the perspective for me(2D side scrolling) and already has animations available.

I went through the list of animations available, playing through each of them first. To do this I had to remove some code under Update to make him stop walking around and then swap out Walk with an Idle animation. Switch Jump with the animation I wanted to see. If there's a Walk and a Jump there must be an Idle so i just input Idle and it worked. After going through the code I knew what was happening and what the different parts were.

At this point, I decided to put down code and think about what I wanted to do. There are these limitations of how animations can be triggered and tracked when they ended. I ideally couldn't figure out if I can pause an animation mid-way, so I considered it as a constraint. For some reason I wanted to work on a Physics game. Something that felt tedious, that got you being like "I CAN DO THIS" but also going like "GOSH I HAE THIS SO MUCH".

The tedious stood out and I was thinking of mechanics that feel tedious or tasks which feel tedious. I have been playing a lot of Hades, recently so it might be because of that but I made my way to the myth of Sisyphus. 

### Gameplay Idea
With that fixed I wanted to make gameplay where the player rolls a boulder endlessly along a slope but there would be tiny rocks in the way which the boulder would hit and then start bouncing around like crazy. If the boulder bounced and rolled past the player bheind him then they lose.

With this as the central core I worked toward building this and I think I'm sort of there. I got the boulder to do wonky things and it is really fun to see it bounce around when it hits a rock. Sometimes underwhelming sometimes "OMG do not even try going past me".

### Struggles
Not knowing the language or Phaser 4 was a real handicap. I was using claude to guide on what I need to do but still the lack of a frontend like Unity or Gamemaker made i really hard for me to work with Phaser 4 and JavaScript. While the flow of it was vry similar to Unity there was still a huge difference in how it came together. I did find Phaser Editor but I couldn't import this project properly into it and start working on it using the Phaser Editor.

The other thing that definitely put me off was the available animations. There were tons of it but also there was very limited control which I had over it. This is definitely from my own lack of inexperience with the engine and language but also making animations with just code is something I'm not too familiar with. I'm used to Game engines or animation software.

### 48 more hours?
Given an extra two days, I'd definitely work towards implementing player walk but in a very tediouos manner. Right now he walks(more like moves) slolyw and it is something which I'm aware of but slow doesn't mean tedious. Tedious needs to have some form of struggling effort, of fighting against something that's holding you back/pushing against you. Tedious needs to involve some amount of "progress made but at what cost" associated with it.

I'd also make sure that it is an endless scroller with a tracker of how far you have travelled and have it be shown when someone is playing it. Also at the end when the GAMEOVER appears because it'll be nice. I'd stop with this because this by itself is a large enough scope when working with something comletely new for me.
