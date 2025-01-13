// contentScript.js
let isSessionActive = true;
chrome.runtime.onMessage.addListener(
   async (request, sender, sendResponse) => {
      if (request.action === 'stop') {
          console.log('Stop button clicked!');
          isSessionActive = false;
          console.log(isSessionActive);
      }

     if (request.action === 'start') {
       console.log('Start button clicked!');
       
       const keywords = request.keywords;
       const responses = request.responses;
       const replies = request.replies;
       const speed = request.speed;
       const followCriteria = request.followCriteria;
       const Retweet = request.Retweet;
       console.log(`Keywords: ${keywords} Responses: ${responses} Replies: ${replies} Speed: ${speed} Follow Criteria: ${followCriteria}`);
       let minTime = 0;
       let maxTime = 0;
       if (speed === 'slow') {
          minTime = 3000;
          maxTime = 8000;

       } else if (speed === 'medium' ){
             minTime = 5000;  
             maxTime = 6000;
       } else if (speed === 'fast') {
             minTime = 1000;
             maxTime = 3000;
       }
       let index = 0;
       let ReplyPerSession =0;
       while (isSessionActive) {
         // Re-query tweets inside the loop to capture new tweets
         // const tweets = document.querySelectorAll('div[data-testid="tweetText"]');
         const tweets = document.querySelectorAll('article[data-testid="tweet"]');
         
         console.log(`Found ${tweets.length} tweets`);
         while (index < tweets.length) {


          await scrollToElement(tweets[index]);

       
           const tweet = tweets[index];
           const tweetText = tweet.innerText;
           console.log(`Tweet at index ${index}: ${tweetText}`);
          
           // Check if the tweet matches the criteria
           if (matchesCriteria(tweetText, keywords)) {
            // Reply to the tweet
            await tweetLike(tweet);
            await randomSleep(minTime, maxTime);
            if (Retweet)
            {
              await reTweet(tweet);
              await randomSleep(minTime, maxTime);
            }
            
            if (followCriteria)
            {
              await followUser(tweet);
              await randomSleep(minTime, maxTime);
            }
            if (ReplyPerSession < parseInt(replies))
            {
              await replyToTweet(tweet, responses);
              await randomSleep(minTime, maxTime);
              ReplyPerSession=ReplyPerSession+1;
            }
            // else
            // {
            //   ReplyPerSession=0;
            //   location.reload();
             
              
            // }
            // Follow the user
          }
          // Move to the next tweet
          await randomSleep(minTime, maxTime);
          index++;
         
       }

       if (index >= tweets.length) {
        
            index = 5;
          
         console.log('No more tweets to process. Waiting for 10 seconds before checking again.');
         // Wait for a while before checking for new tweets
         await randomSleep(minTime, maxTime);
       }
      
      }
     }
   }
 );
 
 
 async function scrollToElement(element) {
  return new Promise((resolve) => {
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    window.scroll({ top: elementPosition, behavior: 'smooth' });

    // Wait for the scrolling to finish
    const checkScroll = setInterval(() => {
      const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
      const scrolledToElement = Math.abs(window.scrollY - elementPosition) < 2;
      if (atBottom || scrolledToElement) {
        clearInterval(checkScroll);
        resolve();
      }
    }, 100);
  });
}

 async function randomSleep(minTime, maxTime) {
   const delay = Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
   return new Promise(resolve => setTimeout(resolve, delay));
 }

 function matchesCriteria(tweetText, keywords) {
   const keywordArray = keywords.split(',');
   for (let keyword of keywordArray) {
     const regex = new RegExp(keyword.trim(), 'i');
     if (regex.test(tweetText)) {
       return true;
     }
   }
   // If none of the keywords matched, return false
   return false;
 }


 
async function replyToTweet(tweet, response) {
   const replyButton = tweet.querySelector('button[data-testid="reply"]');
   if (replyButton) {
     replyButton.click();
   }
   await randomSleep(1000, 2000); // Adjust delay if needed
   

   const textarea  = document.getElementsByClassName("public-DraftStyleDefault-block public-DraftStyleDefault-ltr")[0]

   if (textarea) {
    textarea.click()
    const textToType = response;
    const typingSpeed = 50; // milliseconds per character
    
    function typeInTextarea(textarea, text, index = 0) {
      return new Promise((resolve) => {
        if (index < text.length) {
          textarea.textContent += text[index];
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          setTimeout(() => {
            typeInTextarea(textarea, text, index + 1).then(resolve);
          }, typingSpeed);
        } else {
          resolve();
        }
      });
    }
    
    await typeInTextarea(textarea, textToType);
    
   }

   await randomSleep(1000, 2000); // Adjust delay if needed

  

   const sendButton = document.querySelector('button[data-testid="tweetButton"]');
   if (sendButton)
   {
      sendButton.click();
   }
   
   console.log(`Replying to tweet  with response: ${response}`);
 }
 
//  async function followUser(tweet) {
  
  
//    const usernameElement = tweet.querySelector('div [data-testid="User-Name"]');
//    const anchorElement = usernameElement.querySelector('a');
//    if (anchorElement) {
//     const userUrl = anchorElement.href;

//     // Open the user's profile in a new tab
//     window.open(userUrl, '_blank');
//     const followButton = document.querySelector("*//div[@data-testid='placementTracking']//span/span[contains(text(), 'Follow')]");
//     followButton.click()

//     console.log(`Following user of tweet: ${userUrl}`);
//   } else {
//     console.log('No anchor element found.');
//   }

//  }

async function followUser(tweet) 
{
  console.log("hey ");
  const usernameElement = tweet.querySelector('div[data-testid="User-Name"]');
  const anchorElement = usernameElement.querySelector('a');
  const userUrl = anchorElement.href;
  console.log(userUrl);

  // Open a new tab
  const newTab = window.open(userUrl, '_blank');

  // Wait for the new tab to load completely
  await new Promise(resolve => newTab.addEventListener('load', resolve));

  // Switch to the new tab
  newTab.focus();

  // Wait for some time (adjust as needed)
  await randomSleep(2000, 3000);

  // Check if the follow button exists
  const followButton = newTab.document.querySelector('*[data-testid="placementTracking"] span span');
  console.log(followButton);
  followButton.click();
  console.log(`Following user of tweet: ${anchorElement.href}`);

  // Wait for some time (adjust as needed)
  await randomSleep(2000, 3000);

  // Close the new tab
  newTab.close();

  // Switch back to the original tab
  window.focus();
  
}

 async function tweetLike(tweet) {
   const likeButton =  tweet.querySelector('button[data-testid="like"]');
   if (likeButton) {
     likeButton.click();
   }
   console.log(`Liking tweet:`);
   
 }

 async function reTweet(tweet) {
   const retweetButton =  tweet.querySelector('button[data-testid="retweet"]');
   if (retweetButton) {
     retweetButton.click();
   }
    await randomSleep(2000, 3000); // Adjust delay if needed
   const confirmRetweetButton = document.querySelector('div[data-testid="retweetConfirm"]');
   if (confirmRetweetButton) {
     console.log("Retweeting");
     confirmRetweetButton.click();
   }
   console.log(`Retweeting tweet:`);
 }
