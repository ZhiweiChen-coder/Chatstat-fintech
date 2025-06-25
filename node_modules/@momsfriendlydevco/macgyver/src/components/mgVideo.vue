<script lang="js">
export default app.mgComponent('mgVideo', {
	meta: {
		title: 'Video',
		icon: 'far fa-film',
		category: 'Media',
		preferId: true,
	},
	props: {
		url: {type: 'mgUrl'},
		altUrl: {type: 'mgUrl'},
		width: {type: 'mgText', default: '100%'},
		height: {type: 'mgText', default: '315px'},
		autoPlay: {type: 'mgToggle', default: false},
		showControls: {type: 'mgToggle', default: true},
		loop: {type: 'mgToggle', default: false},
		mute: {type: 'mgToggle', default: false},
	},
	computed: {
		videoResource() {
			if (!this.$props.url) {
				return {type: 'none'};
			} else if (/^https?:\/\/(www\.)?youtube\.com/.test(this.$props.url)) {
				return {
					type: 'youTube',
					url: this.$props.url
						+ `?autoplay=${this.$props.autoPlay ? '1' : '0'}`
						+ `&controls=${this.$props.showControls ? '1' : '0'}`
						+ `&loop=${this.$props.loop ? '1' : '0'}`
				};
			// TODO: What other video formats?
			} else if (/\.mp4$/.test(this.$props.url)) {
				return {
					type: 'file',
					url: this.$props.url,
					altUrl: this.$props.altUrl,
					contentType: 'video/mp4',
				};
			} else {
				return {type: 'unknown'};
			}
		},
	},
});
</script>

<template>
	<div class="mg-video" :style="{width: $props.width, height: $props.height}">
		<div
			v-if="!videoResource || videoResource.type == 'none'"
			class="alert alert-warning"
		>
			No video URL provided
		</div>

		<iframe
			v-if="videoResource.type == 'youTube'"
			:src="videoResource.url"
			width="100%"
			height="100%"
			frameborder="0"
			allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		/>

		<video v-if="videoResource.type == 'file'"
			:autoplay="autoPlay"
			:controls="showControls"
			:loop="loop"
			:mute="mute"
		>
			<source :type="videoResource.contentType" :src="videoResource.url"/>
			<img v-if="videoResource.altUrl" :src="videoResource.altUrl"/>
		</video>

		<div
			v-if="videoResource.type !== 'none' && videoResource.type !== 'youTube' && videoResource.type !== 'file'"
			class="alert alert-warning" 
		>
			Unsupported video URL
		</div>
	</div>
</template>

<style>
.mg-video .alert {
	display: flex;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;
}
</style>
