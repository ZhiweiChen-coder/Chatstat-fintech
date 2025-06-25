<script lang="js" frontend>

app.component('faq', {
	route: '/faq',
	routeRequiresAuth: false,
	data() { return {
		faq: [
			{
				question: `How do I register for an account?`,
				answer: `<ol><li>To get to the account creation screen: go to <a href="/signup">www.chatstat.com/signup</a></li><li>Fill in the following details:<ul><li>Name</li><li>Email address</li><li>Password</li></ul></li><li>Click on “Register” to move onto next step/page</li><li>Check your chosen email account and open the email from Chatstat to verify your account.</li><li>Once the validation link on the email is clicked, you will be directed to the login page.</li></ol>`,
			},
			{
				question: `How do I reset a forgotten password`,
				answer: `<ol><li>Go to <a href="/recover">www.chatstat.com/recover</a></li><li>Enter the email account you used to sign up</li><li>Check your chosen email account and open the email from Chatstat to verify your password reset.</li><li>Click on the link in the email and enter your new password.</li><li>Click “Set new password” to confirm your new password.</li></ol>`,
			},
			{
				question: `How do I create a new River/Watchlist?`,
				answer: `<ol><li>User (general public) logs in and is taken to “Charts” view</li><li>Clicks on “Create new River/Watchlist” button in top-right to be taken to “Add new river to watch” page</li><li>Give the River/Watchlist a name: “Bill and Melinda Gates”</li><li>Select the Platform of the account you want to follow (e.g. Twitter)</li><li>Enter the ‘handle’ of the social media account(s) to watch<ul><li>Bill Gates’ Twitter</li><li>Melinda Gates’ Twitter</li><li>Microsoft Twitter</li><li>Apple Twitter</li></ul></li><li>Set Keywords: i.e. “assets”, “settlement” and “dollars”</li><li>Selects asset to watch: NASDAQ:MSFT and NASDAQ:AAPL</li><li>Enables setting to receive notifications when there is a match</li><li>Finally, hit “Create” to confirm the creation of new river</li></ol>`,
			},
			{
				question: `What Platforms are available to view?`,
				answer: `The Twitter platform is currently available, with more platforms scheduled to be added in the near future.`,
			},
			{
				question: `How do I suggest a feature or service I’d like to see included with Chatstat?`,
				answer: `We’d love to hear from you! Please send any suggestions through to us at <a href="/feedback">www.chatstat.com/feedback</a>`,
			},
			{
				question: `How do I enter the name of the social media account I want to explore?`,
				answer: `On the User Dashboard in the Name section, enter the name/handle of the account you would like to explore. For example, for Elon Musk’s Twitter account you would enter @elonmusk`,
			},
			{
				question: `What is the Top 5 Searches menu?`,
				answer: `The Top 5 Searches is a list of the most searched topics on Chatstat. We provide this as an example for what topics may be of interest and as a guide for new users to the Chatstat experience.`,
			},
			{
				question: `Will my searches be kept private?`,
				answer: `We won’t disclose your personal search history to any other members. The Top 5 Searches list is a combination of all trending searches and is not representative of any individual user.`,
			},
			{
				question: `What is the Keyword section for?`,
				answer: `The Keyword section is where you can enter a search term (e.g. doge) or list of Keywords (e.g. to the moon) for the Chatstat system to search against. For example, you might want to set a notification for whenever Elon Musk mentions the word ‘doge’ from his Twitter account, and search to see what the historical price fluctuations were in Dogecoin when these search criteria matched.`,
			},
			{
				question: `How do I add additional Keywords?`,
				answer: `In the Keyword section of the User Dashboard, click the ‘add +’ tab to add additional keywords.`,
			},
			{
				question: `What Exchanges are available to view?`,
				answer: `Crypto, NYSE and Nasdaq exchanges are currently available, with more exchanges scheduled to be added soon.`,
			},
			{
				question: `How do I enter the symbol of the crypto or stock I want to evaluate?`,
				answer: `In the User Dashboard, after you select the Exchange you want to use, then enter the symbol you want to examine. For instance, you might choose ‘Crypto’ from the Exchange list, then enter one of the following approved symbols for Bitcoin, either Bitcoin, BTC, XBT, ฿, or ₿.`,
			},
			{
				question: `I have a question about my account, where can I get help?`,
				answer: `Please contact us with any questions about your account or general enquiries at <href="/support">www.chatstat.com/support</a> and we’ll be happy to assist you.`,
			},
		],
	}},
});
</script>

<template>
	<main class="mx-n3 mx-md-n4">
		<sitenav/>

		<div class="bg-white">
			<section class="container pt-6 mb-7">
				<div class="row justify-content-center">
					<div class="col-lg-9">
						<h1 class="display-4 mb-0 text-center">Frequently asked questions</h1>
						<video class="w-100 mt-6" controls preload="metadata">
							<source src="/assets/media/rbb019.mp4" type="video/mp4">
						</video>
						<div class="accordion mt-6" id="accordion-faq">
							<div class="mt-2" v-for="(item, index) in faq">
								<div :id="`faq-${index + 1}-heading`" class="d-flex align-items-center collapsed rounded-lg w-100 bg-light px-3 py-2" type="button" data-toggle="collapse" :data-target="`#faq-${index + 1}-contents`" aria-expanded="false" :aria-controls="`faq-${index + 1}-contents`">
									<span class="text-dark text-left font-weight-bolder flex-grow-1 mr-3">{{item.question}}</span>
									<span class="ml-auto">
										<i class="fas fa-caret-down text-secondary"></i>
									</span>
								</div>
								<div :id="`faq-${index + 1}-contents`" class="collapse" :aria-labelledby="`faq-${index + 1}-heading`" data-parent="#accordion-faq">
									<div class="px-3 py-2" v-html="item.answer"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="container mt-6 pb-7">
				<h1 class="mb-0 text-center">Definitions</h1>
				<div class="row justify-content-center mt-4">
					<div class="col-sm-10 col-lg-8">
						<dl>
							<dt>River</dt>
							<dd>A river consists of one or more streams, one or more keywords and one or more flows.</dd>
							<dt>Stream</dt>
							<dd>Part of a River. It is a source of events (e.g. a Twitter profile)</dd>
							<dt>Keyword</dt>
							<dd>Part of a River. It is a search word to look for in an event and process further if there is a match.</dd>
							<dt>Flow</dt>
							<dd>Part of a River. It is an asset (stock/cryptocurrency) to analyze in relation to the rest of the parameters in the river.</dd>
							<dt>Event</dt>
							<dd>An article/post/item of interest. E.g. Twitter post.</dd>
							<dt>Event panel</dt>
							<dd>A component that shows an event's content (date, content, stats, location, etc.) alongside analysis (prediction and sentiment).</dd>
							<dt>Chart</dt>
							<dd>Interchangeable with graph however to maintain consistency ‘chart’ to be used app-wide</dd>
							<dt>Timeline</dt>
							<dd>A view found when viewing a River. It lists all events in reverse chronological order</dd>
							<dt>Sentiment</dt>
							<dd>(sentiment analysis) gauging whether the information in an event is positive, neutral or negative and by how much.</dd>
						</dl>
					</div>
				</div>
			</section>
		</div>

		<div class="bg-light">
			<div class="container py-7">
				<div class="row justify-content-center">
					<div class="col-lg-9">
						<h4 class="text-center mb-0">Any more questions?</h4>
						<section class="mt-5">
							<contactform/>
						</section>
					</div>
				</div>
			</div>
			<sitefooter/>
		</div>
	</main>
</template>

<style scoped>
	.accordion [data-toggle="collapse"] {
		cursor: pointer;
	}

	.accordion {
		[data-toggle="collapse"] {
			transition: background-color ease-in-out 200ms;
		}

		[data-toggle="collapse"] > .text-dark {
			transition: color ease-in-out 200ms;
		}

		i.fa-caret-down {
			transition:
				color ease-in-out 200ms,
				transform ease-in-out 200ms;
		}
	}

	// Change FAQ header styles when opened.
	.accordion [data-toggle="collapse"]:not(.collapsed) {
		background-color: var(--main) !important;

		> .text-dark {
			color: white !important;
		}

		i.fa-caret-down {
			color: white !important;
			transform: rotate(90deg);
		}
	}
</style>
