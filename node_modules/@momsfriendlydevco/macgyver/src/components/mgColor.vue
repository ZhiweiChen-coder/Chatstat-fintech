<script lang="js">
import Swatches from 'vue-swatches';
import 'vue-swatches/dist/vue-swatches.min.css';

export default app.mgComponent('mgColor', {
	meta: {
		title: 'Color',
		icon: 'far fa-paint-roller',
		category: 'Simple Inputs',
		preferId: true,
		shorthand: ['color', 'hue', 'swatch'],
	},
	props: {
		title: {type: 'mgText'},
		required: {type: 'mgToggle', default: false},
		colorSet: {type: 'mgChoiceDropdown', enum: [{id: 'basic', title: 'Basic'}, {id: 'material-light', title: 'Material'}, {id: 'text-advanced', title: 'Full swatch'}], default: 'text-advanced'},
		interface: {type: 'mgChoiceDropdown', default: 'input', enum: ['input', 'colorOnly']},
		placeholder: {type: 'mgText', help: 'Ghost text to display when there is no value'},
		popoverSide: {type: 'mgChoiceButtons', enum: ['left', 'right'], advanced: true},
	},
	components: {Swatches},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
	methods: {
		change(e) {
			var value = e.target.value;
			if (value && /^#[0-9A-F]+$/i.test(value)) {
				this.data = value;
			}
		},
	},
});
</script>

<template>
	<div class="mg-color">
		<div v-if="$props.interface == 'input'" class="input-group">
			<div class="input-group-prepend">
				<swatches
					:value="data"
					:colors="$props.colorSet"
					:popover-to="$props.popoverSide"
					class="input-group-text"
					@input="data = $event.toUpperCase()"
				/>
			</div>
			<input
				:value="data"
				type="text"
				class="form-control"
				:placeholder="$props.placeholder"
				@input="change"
			/>
		</div>
		<swatches
			v-else
			:value="data"
			:colors="$props.colorSet"
			:popover-to="$props.popoverSide"
			@input="data = $event.toUpperCase()"
		/>
	</div>
</template>

<style>
.mg-color .input-group > .input-group-prepend .vue-swatches {
	padding: 3px;
}

.mg-color .input-group > .input-group-prepend .vue-swatches .vue-swatches__trigger {
	width: 30px !important;
	height: 30px !important;
}
</style>
