# ArticleAdjuster
Title: Article Adjuster
Live link: https://article-adjuster-4447a3.netlify.app/

User Needs Statement: Yolanda, a Spanish teacher at Nueva, wants a website that will convert articles in Spanish to any language level, so that her students can read about complex topics but with more simple language. The suggested solution will help her create reading materials that are at the right level for her students more quickly. It can also be used by students in case they find an article and want to adjust it to a different level. 

To use the website, the user first copies and pastes their text into the box. This article adjuster works by using a Gemini 2.5pro API, and prompting it for different ACTFL levels depening on the button the user clicks. It then returns the adapted text below. 

Bugs/Improvements:
1. Currently the article adjuster is able to generally adapt the articles to different levels, but not specific enough to the ACTFL standards. We want to make the distinction more clear and have a distinct gemini prompt for each level in order to specify specific traits of the levels. 
2. The link box where users can copy paste a link in doesn't work right now and is just a placeholder. Ideally, I want users to be able to copy paste the link of an article and then for it to be scraped and converted to text. I tried using different ai like gemini and chatgpt to scrape the websites, but it didn't work very well because there are a lot of bot blockers. 


