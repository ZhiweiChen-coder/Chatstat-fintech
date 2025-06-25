<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgChoiceTree').enable(false);

import _ from 'lodash';

export default app.mgComponent('mgChoiceTree', {
	meta: {
		title: 'Choice Tree',
		icon: 'fas fa-stream',
		category: 'Choice Selectors',
		preferId: true,
	},
	data() { return {
		enumIter: undefined,
	}},
	props: {
		enum: {
			type: 'mgTable',
			title: 'List items',
			items: [
				{id: 'id', title: 'ID'},
				{id: 'title', title: 'Title'},
				{id: 'icon', title: 'Icon'}, // Icon used to override both item.iconOpen + item.iconClosed
				// 'enum': FIXME: We can't recursively edit children yet
			],
		},
		// TODO: Support for "enumSource"/"enumUrl"
		// TODO: optionsPath/optionLabelPath/optionKeyPath -> getOptionLabel/getOptionKey?
		required: {type: 'mgToggle', default: false, help: 'One choice must be selected'},
		collapsable: {type: 'mgToggle', default: true, help: 'Allow branches to be closed'},
		selectBranches: {type: 'mgToggle', default: false, help: 'Allow selection of tree branches rather than just end leaves'},
		classWrapper: {type: 'mgText', default: 'mg-choice-tree', title: 'Group CSS class', advanced: true},
		branchClass: {type: 'mgText', default: 'mg-choice-tree-branch list-group', title: 'Branch CSS class', advanced: true},
		itemClassActive: {type: 'mgText', title: 'Item class active', default: 'btn btn-primary text-left', advanced: true},
		itemClassInactive: {type: 'mgText', title: 'Item class inactive', default: 'btn btn-light text-left', advanced: true},
		iconClassBranch: {type: 'mgIcon', title: 'Branch icon base', default: 'far fa-folder fa-lg', advanced: true},
		iconClassBranchOpen: {type: 'mgIcon', title: 'Branch icon open (overrides base)', default: '', advanced: true},
		iconClassBranchClosed: {type: 'mgIcon', title: 'Branch icon closed (overrides base)', default: '', advanced: true},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
	methods: {
		select(item) {
			if (this.$props.collapsable && !item.isLeaf && !item.open) { // Item is closed - user probably wants it open
				console.log('Toggle open (node is closed)');
				item.isOpen = !item.isOpen;
			} else if ((item.isLeaf || this.$props.selectBranches) && item.active != item.id) { // Item is selectable but not selected - user probably wants it selected
				if (!this.$props.required && this.data == item.id) {
					console.log('Deselect');
					this.data = undefined;
				} else {
					console.log('Select');
					this.data = item.id;
					console.log('DATA', this.data);
				}
			} else if (this.$props.collapsable && !item.isLeaf) { // No idea, but item is not a leaf, maybe the user wants to toggle it?
				console.log('Toggle open');
				item.open = !item.isOpen;
			} else { // Give up
				console.warn('FIXME: No idea what the user wants to do when clicking on item', item);
			}

			this.$forceUpdate(); // FIXME: Not happy with this but no idea how to make the render function selectively update yet
		},

		toggleOpen(item) {
			item.isOpen = !item.isOpen;
			this.$forceUpdate(); // FIXME: Again, not happy
		},
	},
	watch: {
		/**
		* Remap the incomming `enum` into an iterable array-of-arrays
		* Each child will be of the form {id, title, enum?, isOpen, isLeaf}
		*/
		'$props.enum': {
			immediate: true,
			handler() {
				if (!this.$props.enum) return; // Nothing to render yet

				var walkBranch = items => {
					return items.map(item => {
						if (typeof item == 'string') item = {title: item, id: _.camelCase(item)};
						item.isOpen = true;

						item.isLeaf = !item.enum || item.enum.length < 1;
						if (!item.isLeaf) item.enum = walkBranch(item.enum);

						return item;
					});
				}

				this.enumIter = walkBranch(this.$props.enum);
			},
		},
	},
	render(h) {
		var renderBranch = (items, isOpen) => h(
			'div',
			{class: [
				this.$props.branchClass,
				isOpen && 'open',
			]},
			items.map(item => [
				h(
					'div',
					{
						class: this.data == item.id ? this.$props.itemClassActive : this.$props.itemClassInactive,
						on: {
							click: e => {
								this.select(item);
								e.stopPropagation();
							},
						},
					},
					[
						h('i', {
							class:
								item.isOpen && item.iconOpen ? item.iconOpen
								: item.isOpen && item.icon ? item.icon
								: item.isOpen && this.$props.iconClassBranchOpen ? this.$props.iconClassBranchOpen
								: !item.isOpen && item.iconClosed ? item.iconClosed
								: !item.isOpen && item.icon ? item.icon
								: !item.isOpen && this.$props.iconClassBranchClosed ? this.$props.iconClassBranchClosed
								: this.$props.iconClassBranch,
							on: {
								click: e => {
									this.toggleOpen(item);
									e.stopPropagation();
								},
							},
						}),
						h('span', {class: 'mg-choice-tree-title'}, item.title),
						item.enum ? renderBranch(item.enum, item.isOpen) : undefined,
					],
				),
			])
		);

		return h('div', {class: this.$props.classWrapper}, [renderBranch(this.enumIter, true)]);
	},
});
</script>

<style>
.mg-choice-tree-branch {
	margin-left: 32px;
}

.mg-choice-tree-branch:not(.open) {
	display: none;
}

.mg-choice-tree-branch i {
	margin-right: 5px;
}
</style>
