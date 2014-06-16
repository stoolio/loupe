loupe is a lightweight onhover image magnifier for jQuery.

see here for demos & instructions: http://jdbartlett.github.com/loupe

#### Added by Steven Migliorato 06-16-14

I spent a good two nights hacking away at this library for use in another project.

Needless to say, I did not follow git best practices.

I think there are a few more improvements I can make, particularly to the code organization. I am going to "rewrite" it, **jquery.loupe.improved.js**, with more atomic commits.

For now, here are the improvements you can play around with. Keep in mind, I haven't done a full battery of testing on this thing, so consider this a beta at best.

* Precomputed as many values as possible. They are only recomputed on a window resize (which has the potential to change image sizes, especially in a responsive site).
* Simplified the equation to calculate the background image position
* Only mouse coordinates are grabbed in the mousemove event function for speed
* All other calculation, and most importantly, animation, is handled in a requestAnimationFrame, with fallback to setTimeout
* Basic support for touch. Currently, it's best to include Modernizr for a complete touch support test. A tap shows the loupe. Clicking on the loupe closes it, clicking elsewhere on the image moves it. Drag support doesn't seem to have the kind of fluid experience I would hope for, so this seems to be the best solution. I'm open to improvements, but dragging does "sort of" work.
* Remy Sharp's debounce function is included, but if you include Ben Alman's jquery-throttle-debounce plugin, his function will be used instead. Resize and scroll events are debounced.
* Everything except the resize callback is only binded while the loupe is active. The scroll event is new, and prevents scrolling from messing with the loupe and causing issues. If your curious try turning it off.
* I tried to comment as much as possible, I hope it's helpful

There might be some more I could include, I will clean this up when I get the chance.
