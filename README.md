# ArticleAdjuster
Title: Article Adjuster
Live link: https://article-adjuster.vercel.app/

User Needs Statement: Yolanda, a Spanish teacher at Nueva, wants a website that will convert articles in Spanish to any language level, so that her students can read about complex topics but with more simple language. The suggested solution will help her create reading materials that are at the right level for her students more quickly. It can also be used by students in case they find an article and want to adjust it to a different level. 

To use the website, the user first copies and pastes their text into the box. This article adjuster works by using a Gemini 2.5pro API, and prompting it for different ACTFL levels depening on the button the user clicks. It then returns the adapted text below. Since there is a limit of 2RPM, if the Gemini2.5Pro model reaches its API limit, it then switches to the Gemini2.5Flash model which has a limit of 10RPM. It also tells the user when it has switched so that they know they're getting a worse model and that they can try again in a couple minutes. 

Bugs/Improvements:
1. The scraping function works but not completely. It doesn't work on certain websites, especially government or paywall websites which makes sense and is fine. In that case, users can just copy paste their article directly. However, sometimes the scraper works, but scrapes wrong parts of the website like random links or characters which then make their way into the summarized version. In this case, the user should copy paste the article directly again, but it isn't ideal. 
2. In the future, maybe I can look into adding a function where you can have the website in Spanish or English. Since Yolanda prefers teaching her class in an immersive style, it would probably be better for the website to be in Spanish. However, some Spanish 1 and 2 students might not be able to use it then. So, a button to switch between the two may be helpful.
3. I could make this website into other languages, like Chinese or Japanese, so that other language teachers at Nueva could use it. However, they might teach to different standards or have different requests that I would have to adjust the app to.

Testing Instructions: 
jest - 
Go to terminal
Change the directory to Article Adjuster backend
npm test

cypress - 
cd backend
npm start
Right click index.html and select "Open With Live Server"
Open new terminal 
cd Article Adjuster
npx cypress run

Rate Limits:
Gemini 2.5 Pro:	2RPM, 125,000 TPM, 50 RPD
Gemini 2.5 Flash: 10 RPM, 250,000 TPM, 250 RPD
Vercel: https://vercel.com/docs/limits