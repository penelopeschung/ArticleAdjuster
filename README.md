# ArticleAdjuster
Title: Article Adjuster
Live link: https://article-adjuster-4447a3.netlify.app/

User Needs Statement: Yolanda, a Spanish teacher at Nueva, wants a website that will convert articles in Spanish to any language level, so that her students can read about complex topics but with more simple language. The suggested solution will help her create reading materials that are at the right level for her students more quickly. It can also be used by students in case they find an article and want to adjust it to a different level. 

To use the website, the user first copies and pastes their text into the box. This article adjuster works by using a Gemini 2.5pro API, and prompting it for different ACTFL levels depening on the button the user clicks. It then returns the adapted text below. 

Notes:
1. I have included only levels from novice - advanced, excluding the superior and distinguished levels because from what I've read in the ACTFL guide, people who are at these levels should be able to read a normal article without needing adaptation.
2. I also excluded the mid tier, only including low and high because I feel like there wouldn't be clear enough of a distinction between them. But, I could always add it too. 

Bugs/Improvements:
1. The link box where users can copy paste a link in doesn't work right now and is just a placeholder. Ideally, I want users to be able to copy paste the link of an article and then for it to be scraped and converted to text. I tried using different ai like gemini and chatgpt to scrape the websites, but it didn't work very well because there are a lot of bot blockers. 
2. I'd like for there to be an option to have the website in Spanish or English or to switch between the two. That way, a more advanced Spanish student can use the website in Spanish, but a Spanish 1 student could use it in English.


