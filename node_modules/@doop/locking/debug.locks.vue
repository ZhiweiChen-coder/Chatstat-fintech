<script lang="js" frontend>
app.component({
	route: '/debug/locks',
	data() { return {
	}},
});
</script>

<template>
	<div class="card">
		<lock :lock="{ debug: 1 }">
			<form>
				<fieldset label="Fieldset">
					<div class="card-body form-horizontal">
						<div class="form-group row">
							Contents
						</div>
						<div class="form-group row">
							<input placeholder="Disabled?" value="Disabled?"/>
						</div>
					</div>
				</fieldset>
			</form>
		</lock>
	</div>
</template>