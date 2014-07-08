loupe is a lightweight onhover image magnifier for jQuery.

see here for demos & instructions: http://jdbartlett.github.com/loupe

improved version demo is here: http://stoolio.github.com/loupe

I attempted to contact the author of the original, but I've heard nothing back. I may end up renaming this and working on separately.

#### Added by stoolio 06-16-14

I spent a good two nights hacking away at this library for use in another project.

I think there are a few more improvements I can make, particularly to the code organization. I would also like to get some jquery plugin best practices integrated for configurability etc.

For now, here are the improvements you can play around with. Keep in mind, I haven't done a full battery of testing on this thing, so consider this a beta at best.

* Precomputed as many values as possible. They are only recomputed on a window resize (which has the potential to change image sizes, especially in a responsive site).
* Simplified the equation to calculate the background image position
* Only mouse coordinates are grabbed in the mousemove event function for speed
* All other calculation, and most importantly, animation, is handled in a requestAnimationFrame, with fallback to setTimeout
* Basic support for touch. Currently, it's best to include Modernizr for a complete touch support test. A tap shows the loupe. Clicking on the loupe closes it, clicking elsewhere on the image moves it. Drag support doesn't seem to have the kind of fluid experience I would hope for, so this seems to be the best solution. I'm open to improvements, but dragging does "sort of" work.
* A debounce function is included, but if you include the query-throttle-debounce plugin, that function will be used instead. Resize and scroll events are debounced for performance.
* Everything except the resize callback is only bound while the loupe is active for further performance gains. The scroll event is new, and prevents scrolling from messing with the loupe and causing issues. If you're curious try turning it off.
* I tried to comment as much as possible, I hope it's helpful

As stated before, this is not production ready. Touch support is very basic, I haven't tested multiple loops on a page (the other changes should improve performance in that respect).

** EDIT **

The demo page available at http://stoolio.github.com/loupe features the new library. You can compare to the original at http://jdbartlett.github.com/loupe
