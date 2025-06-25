<script lang="js">
export default app.mgComponent('mgEmail', {
	meta: {
		title: 'Email address',
		icon: 'far fa-at',
		category: 'Simple Inputs',
		preferId: true,
		format: v => {
			if (!v) return '';
			return `<a href="mailto:${v}">${v}</a>`;
		},
	},
	props: {
		title: {type: 'mgText'},
		placeholder: {type: 'mgText', help: 'Ghost text to display when the text box has no value'},
		required: {type: 'mgToggle', default: false},
		disabled: {type: 'mgToggle', default: false},
		readonly: {type: 'mgToggle', default: false},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
			if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(this.data)) return reply(`${this.$props.title} is not a valid email address`);
			if ($(this.$el).children('input[type="email"]')[0].validity.typeMismatch) return reply(`${this.$props.title} is not a valid email address`);
		});
	},
});
</script>

<template>
	<div class="mg-email">
		<input
			v-model="data"
			type="email"
			class="form-control"
			:disabled="$props.disabled"
			:placeholder="$props.placeholder"
			:readonly="$props.readonly"
		/>
	</div>
</template>
