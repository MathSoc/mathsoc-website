# MathSoc Website Transition

The MathSoc web development team is rebuilding the MathSoc website to transition away from the current WordPress implementation.  We seek to rebuild it primarily using `pug` and `Express`, to allow for greater quality, maintainability, and customizability going forward.

We always accept contributions from **current University of Waterloo students**.  Those interested in a more active role should consider applying to join MathSoc's web development team; applications open near the beginning of term.  

## Steps to run locally

1. Clone the repository in the directory of your choice
   - Run this command with git in whichever directory you want to download in: `git clone https://github.com/MathSoc/mathsoc-website.git`
2. Then, cd into the directory with `cd mathsoc-website`, and run `npm install`.
3. The run scripts are defined in `package.json`, but run `npm run dev` to start a development server with nodemon. This will start the server on `http://localhost:3000.`
4. Go to `https://localhost:3000` on your browswer, and you should see the tester page!


