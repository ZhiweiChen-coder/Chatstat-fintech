<script lang="js">
export default app.mgComponent('mgInfoBlock', {
	meta: {
		title: 'Info Block',
		icon: 'far fa-info-square',
		category: 'Data display',
		format: false,
	},
	data() { return {
		isLoading: false,
	}},
	props: {
		text: {type: 'mgText', help: 'Text to display, if a URL is also specified this is overridden when the result loads', default: ''},
		url: {type: 'mgUrl', relative: true, default: '/api/datafeeds/random/number?$extract=number'},
		coloring: {
			type: 'mgChoiceDropdown',
			default: 'bg-primary',
			enum: [
				{id: 'bg-primary text-white', text: 'Primary'},
				{id: 'bg-secondary', text: 'Secondary'},
				{id: 'bg-success text-white', text: 'Success'},
				{id: 'bg-danger text-white', text: 'Danger'},
				{id: 'bg-warning text-white', text: 'Warning'},
				{id: 'bg-info text-white', text: 'Info'},
				{id: 'bg-light', text: 'Light'},
				{id: 'bg-dark text-white', text: 'Dark'},
				{id: 'bg-muted', text: 'Muted'},
			],
		},
		icon: {type: 'mgIcon', default: 'far fa-info-circle'},
		iconLoading: {type: 'mgIcon', default: 'far fa-spinner fa-spin', advanced: true},
		iconSize: {
			type: 'mgChoiceButtons',
			default: 'fa-4x',
			advanced: true,
			enum: [
				{id: '', text: 'Normal'},
				{id: 'fa-2x', text: '2x'},
				{id: 'fa-3x', text: '3x'},
				{id: 'fa-4x', text: '4x'},
				{id: 'fa-5x', text: '5x'},
				{id: 'fa-6x', text: '6x'},
				{id: 'fa-7x', text: '7x'},
				{id: 'fa-8x', text: '8x'},
			],
		},
	},
	created() {
		this.$watch('$props.url', ()=> {
			if (!this.$props.url) return;
			Promise.resolve()
				.then(()=> this.isLoading = true)
				.then(()=> this.$macgyver.utils.fetch(this.$props.url, {
					type: 'object',
					mappings: {extract: {required: true}},
					format: d => d.extract,
				}))
				.then(data => this.$set(this, 'data', data))
				.then(()=> this.isLoading = false)
		}, {immediate: true});
	},
});
</script>

<template>
	<div class="card mg-info-block" :class="$props.coloring">
		<div class="card-body media">
			<div class="mr-3">
				<i :class="[isLoading ? $props.iconLoading : $props.icon, $props.iconSize]"/>
			</div>
			<div class="media-body">
				<div class="mg-info-block-text">{{data || $props.text}}</div>
				<div class="mg-info-block-title">{{$props.title}}</div>
			</div>
		</div>
	</div>
</template>

<style>
.mg-info-block {
	background: transparent;
	border-radius: 5px;
}

.mg-info-block .mg-info-block-text {
	font-size: 200%;
	font-weight: bold;
}

.mg-info-block .mg-info-block-title {
	font-size: 90%;
	opacity: 0.8;
}
</style>
