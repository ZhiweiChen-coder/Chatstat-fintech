<script lang="js">
export default app.mgComponent('mgGrid', {
	meta: {
		title: 'Grid layout',
		icon: 'far fa-grip-horizontal',
		category: 'Layout',
	},
	props: {
		items: {type: 'mgUnknown', default: []},
	},
});
</script>

<template>
	<table class="table table-striped table-bordered">
		<tr v-for="row in $props.items">
			<td v-for="cell in row.items">
				<mg-component
					:form="$props.form"
					:config="cell"
				/>
			</td>
		</tr>
	</table>
</template>
