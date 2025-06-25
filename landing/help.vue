
<script lang="js" frontend>
/**
* Generic landing page
* This page loads either a basic informative squeeze page or <dashboard/> depending on if a session is present
*/
app.component({
	route: '/help',
});
</script>

<template>
<main>
<div class="mx-n3 mx-md-n4 my-n3">
		<div class="d-flex flex-column">
			<div class="container mt-5">
				<div class="row justify-content-center">
					<h1 class="title mt-3 mb-4 text-center">Frequently asked questions</h1>
					<p>
						Duis laoreet consequat felis, sed luctus ante mollis id. Cras volutpat tortor sit amet suscipit ullamcorper. Nullam congue mauris nec urna convallis, at maximus sapien commodo. Donec sed ornare purus, vel egestas libero. Cras sollicitudin posuere mi eu tristique. Suspendisse sit amet felis semper, auctor diam sed, lacinia elit. Fusce vel sodales ex, auctor suscipit lectus. Donec lacinia egestas ullamcorper. Praesent finibus magna id nisi aliquam, non ultrices lorem vehicula. Etiam egestas nisl nec dolor facilisis iaculis. Duis tempor eros ipsum, eget luctus orci egestas eu. Nullam laoreet leo mi, ut imperdiet mauris dignissim eget. Donec efficitur elit nibh, vitae laoreet odio egestas at. Aenean eu eleifend lorem.
					</p>
					<div class="col-lg-9 mt-4 pt-2">
						<form>
							<div class="row justify-content-center align-items-center">
								<div class="accordion" id="accordionFAQ">
									<div class="card">
										<div class="card-header" id="headingOne">
											<h2 class="mb-0">
												<button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
												+ Lorem ipsum dolor sit amet, consectetur adipiscing elit?
												</button>
											</h2>
										</div>
										<div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionFAQ">
											<div class="card-body">
												Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris consectetur, mi ut facilisis viverra, mauris eros tristique risus, ut ultricies erat nulla at lorem.
												Nulla luctus ac nibh eget ultrices. Curabitur non laoreet justo. Nam et mattis mi. Sed dui felis, pretium et arcu at, rutrum mollis ipsum. Donec tellus ipsum, venenatis at ornare ut, venenatis vitae odio.
												Sed bibendum sem sollicitudin ultrices commodo. Etiam luctus augue in purus ultricies, at facilisis mi sagittis.
											</div>
										</div>
									</div>
									<div class="card">
										<div class="card-header" id="headingTwo">
											<h2 class="mb-0">
												<button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
												+ Aenean nibh nibh, hendrerit at iaculis et, eleifend sit amet sem.?
												</button>
											</h2>
										</div>
										<div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionFAQ">
											<div class="card-body">
												Quisque dapibus ex neque, id convallis metus gravida quis. In a erat ipsum. Etiam aliquam elementum tortor, non luctus lectus convallis in. Duis purus orci, suscipit vel viverra ac, dictum ac massa. Praesent vel aliquam enim. Nunc porta nulla vel orci aliquet, vel vestibulum ligula tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed erat ipsum, porttitor in venenatis eu, commodo eget neque. Suspendisse ultrices sem at mattis viverra. Suspendisse cursus in sapien eget facilisis.
											</div>
										</div>
									</div>
									<div class="card">
										<div class="card-header" id="headingThree">
											<h2 class="mb-0">
												<button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
												+ Nulla luctus vestibulum nisi, vel suscipit augue?
												</button>
											</h2>
										</div>
										<div id="collapseThree" class="collapse" aria-labelledby="headingThree" data-parent="#accordionFAQ">
											<div class="card-body">
												Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam luctus dapibus quam, id porta arcu fermentum at. Mauris interdum, ligula ut tincidunt ornare, orci arcu ultrices arcu, et aliquet turpis magna quis nibh. Donec cursus nisi at dolor tempor, id tristique massa tempor. Nam vitae eros ipsum. Vivamus sed metus mattis, bibendum nunc nec, pharetra tortor. Curabitur vitae bibendum nisi. Praesent condimentum auctor sollicitudin. Proin quis ante efficitur, euismod orci ac, volutpat est. Nam euismod volutpat vulputate.
											</div>
										</div>
									</div>
									<div class="card">
										<div class="card-header" id="headingFour">
											<h2 class="mb-0">
												<button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
												+ Phasellus mattis ante dolor, sed ullamcorper sapien efficitur lobortis.?
												</button>
											</h2>
										</div>
										<div id="collapseFour" class="collapse" aria-labelledby="headingFour" data-parent="#accordionFAQ">
											<div class="card-body">
												Praesent luctus facilisis porta. Fusce quis est ac nulla ultricies cursus ut id lacus. Nullam nec ipsum tincidunt, imperdiet felis maximus, pharetra ex. Maecenas gravida volutpat lacus. Duis id mi ut nibh varius consequat non cursus lectus. Sed at lorem ornare, volutpat mauris vitae, consequat diam. Etiam risus felis, gravida a aliquet et, vestibulum in risus. Mauris molestie ultricies lorem, et egestas ipsum mattis eget.
											</div>
										</div>
									</div>
									<div class="card">
										<div class="card-header" id="headingFive">
											<h2 class="mb-0">
												<button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
												+ Sed lobortis ex sed ipsum volutpat, vel gravida justo porta?
												</button>
											</h2>
										</div>
										<div id="collapseFive" class="collapse" aria-labelledby="headingFive" data-parent="#accordionFAQ">
											<div class="card-body">
												Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque molestie mattis dolor in hendrerit. Sed a augue quis elit bibendum semper. Maecenas ac massa vel ex malesuada sollicitudin. Sed eget neque tincidunt, interdum odio id, scelerisque nibh. Praesent suscipit augue at nulla fringilla, volutpat posuere lectus condimentum. Suspendisse et metus condimentum, ullamcorper ipsum vel, eleifend quam. Duis iaculis facilisis rutrum.
											</div>
										</div>
									</div>
									<div class="card">
										<div class="card-header" id="headingSix">
											<h2 class="mb-0">
												<button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
												+ Mauris nisl leo, placerat eu commodo quis, feugiat et erat?
												</button>
											</h2>
										</div>
										<div id="collapseSeven" class="collapse" aria-labelledby="headingSeven" data-parent="#accordionFAQ">
											<div class="card-body">
												Nam quis blandit purus. Suspendisse potenti. Ut justo nisi, laoreet id imperdiet posuere, euismod vitae orci. Pellentesque at viverra augue. Pellentesque scelerisque tellus ac mi aliquam, nec auctor eros suscipit. Praesent risus urna, porta ut libero non, pharetra rhoncus elit. Quisque commodo sagittis nisl at cursus. Praesent justo est, molestie a fringilla vel, vehicula eu dui. Etiam magna leo, volutpat nec metus a, mattis efficitur augue.
											</div>
										</div>
									</div>
									<div class="card">
										<div class="card-header" id="headingSeven">
											<h2 class="mb-0">
												<button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseSeven" aria-expanded="false" aria-controls="collapseSeven">
												+ arius, enim metus vestibulum quam?
												</button>
											</h2>
										</div>
										<div id="collapseSeven" class="collapse" aria-labelledby="headingSeven" data-parent="#accordionFAQ">
											<div class="card-body">
												Nam euismod pretium velit. Etiam urna augue, pellentesque in sapien et, hendrerit porta odio. Duis tempus purus non sapien fringilla ullamcorper. Nunc id lobortis justo. Vivamus commodo massa nec suscipit laoreet. Maecenas at tellus a turpis venenatis placerat. Nulla laoreet sodales tempor. Donec lobortis sagittis odio, id scelerisque eros lobortis vel. Integer nec tempus turpis.
											</div>
										</div>
									</div>
									<div class="card">
										<div class="card-header" id="headingEight">
											<h2 class="mb-0">
												<button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseEight" aria-expanded="false" aria-controls="collapseEight">
												+ Vivamus viverra nec lectus sodales ultrices?
												</button>
											</h2>
										</div>
										<div id="collapseEight" class="collapse" aria-labelledby="headingEight" data-parent="#accordionFAQ">
											<div class="card-body">
												Proin vitae metus nec urna ornare condimentum. Proin consectetur sem id purus lobortis, sed vestibulum magna congue. Proin non laoreet elit, id ultrices turpis. Proin lorem sapien, dictum non dolor quis, fermentum rutrum tortor. In vel posuere elit. Fusce ex dui, pulvinar sit amet tellus eget, imperdiet facilisis nisl. Curabitur eu tempor nisi, et venenatis turpis.
											</div>
										</div>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
			<div class="container mt-5">
				<div class="row justify-content-center">
					<div class="col-12 text-center">
						<div class="section-title mb-4 pb-2">
							<h4 class="title mt-3 mb-4">Any more Questions?</h4>
						</div>
					</div>
				</div>
				<div class="row justify-content-center">
					<div class="col-lg-9 mt-4 pt-2">
						<contactform/>
					</div>
				</div>
			</div>
			</div>
		</div>
	</div>
</main>
</template>

<style scoped>
	.card + .card {
		margin-top:0px;
	}
</style>
