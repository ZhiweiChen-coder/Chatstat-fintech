<script lang="js" frontend>
app.component('sitemapSidebar', {
	data: ()=> ({
		sitemapTree: [],
		lastPath: undefined, // Last route path the sitemap was refreshed for
	}),
	methods: {
		itemClick(node) {
			// NOTE: Navigation is handled by v-href anyway so we only need to toggle opening this node
			this.$set(node, 'opened', !node.opened);
			this.$set(node, 'selected', false);
			if (!node.children && this.$screen.size == 'xs') this.closeSidebar();
		},
		refresh() {
			if (this.lastPath == this.$route.path) return; // Don't regenerate if we're refreshing the same path
			this.lastPath = this.$route.path;

			Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$sitemap.promise())
				.then(tree => {
					this.sitemapTree = tree;
					if (_.isEmpty(this.sitemapTree)) return; // Tree cannot be computed for some reason - user probably not logged in

					// De-select all tree nodes
					TreeTools.flatten(this.sitemapTree).forEach(node => this.$set(node, 'selected', false));

					// Select this node and all its parents
					var branches = TreeTools.parents(this.sitemapTree, {href: this.$route.path})
						.map(node => {
							this.$set(node, 'opened', true);
							this.$set(node, 'selected', true);
							return node;
						})
				})
				.finally(()=> this.$loader.stop())
		},
		closeSidebar() {
			$('.sitemap-sidebar').addClass('is-hidden');
		},
		resize() {
			// When moving to small screen size - disable the sidebar on the first hit
			if (this.$screen.size == 'md') this.closeSidebar();
		},
	},
	created() {
		this.$on('$sitemap.update', this.refresh);
		this.$watch('$route', this.refresh);
		this.$on('$screen.resize', this.resize);
	},
});
</script>

<template>
	<ul class="nav flex-column sitemap-sidebar bg-light py-3" role="navigation">

		<!-- Level 1 - Main sidebar items -->
		<li class="nav-item" v-for="node in sitemapTree" :class="[node.opened ? 'opened' : 'closed', node.selected && 'active']">
			<a class="nav-link px-3 px-md-4 py-2" @click="itemClick(node)" v-href="node.href">
				<i class="h5 mb-0 mr-1 align-text-top" :class="node.icon"></i> {{node.title}}
				<span v-if="node.children" class="menu-arrow pl-2"/>
			</a>

			<ul class="collapse p-0" v-if="node.children">
				<li v-for="node in node.children" :class="node.mapVerbs && node.mapVerbs.length > 0 && 'has-verbs'">
					<div v-if="node.mapVerbs && node.mapVerbs.length > 0" class="float-right">
						<a v-for="verb in node.mapVerbs" :key="verb.title" :class="verb.class" v-href="verb.href"/>
					</div>

					<a @click="itemClick(node)" class="d-block px-6 py-2" :class="[node.selected && 'active']" v-href="node.href">
						{{node.title}}
					</a>

					<!-- Level 2 - Sub items -->
					<ul class="collapse" v-if="node.children">
						<li v-for="node in node.children">
							<a @click="itemClick(node)" v-href="node.href" class="nav-link" :class="node.selected && 'active'">
								{{node.title}}
							</a>
						</li>
					</ul>
				</li>
			</ul>
		</li>
	</ul>
</template>

<style>
	.sitemap-sidebar {
		min-height: 100%;
	}

	.sitemap-sidebar > li {
		width: 15rem;
	}

	/*
	 * Sub menu
	 */
	.sitemap-sidebar {
		.nav-item > .collapse {
			background-color: transparent;
			display: block;
			list-style: none;
			max-height: 0;
			overflow: hidden;
			transition:
				background-color 225ms ease-in-out,
				max-height 225ms ease-out;

			&::before {
				content: '\f107';
				font-family: "Font Awesome 5 Pro";
				font-weight: 300;
				text-align: center;
				display: block;
				right: 1.5rem;
				opacity: 0.333;
				position: absolute;
				pointer-events: none;
				top: 0.75rem;
				transition:
					transform 225ms ease-in;
				width: 1.25em;
			}
		}
	}

	.nav-item.opened > .collapse {
		background-color: rgba(0, 0, 0, 0.04);
		max-height: 100%;
		overflow: visible;
		transition:
			max-height 225ms ease-in,
			overflow 225ms linear;

		&::before {
			transform: rotate(90deg);
		}
	}

	.nav-item > .collapse > li {
		&:first-child {
			padding-top: .75rem;
		}
		&:last-child {
			padding-bottom: .75rem;
		}
	}

	/* Sidebar item */
	.sitemap-sidebar {
		.nav-link,
		.nav-item > .collapse a {
			text-decoration: none;
			transition: background 225ms ease-in-out;

			&:hover {
				background-color: rgba(0, 0, 0, 0.05);
			}
		}

		.nav-item > .collapse a.active {
			&::after {
				background-color: #25D366;
				border-radius: 50%;
				content: '';
				display: block;
				height: 8px;
				margin-top: -1rem;
				position: absolute;
				right: 0.75rem;
				width: 8px;
			}
		}
	}

	.sitemap-sidebar {
		> .nav-item,
		> .nav-item > .nav-link {
			position: relative;
		}

		> .nav-item > .nav-link > i {
			opacity: 0.333;
			transition: opacity 225ms ease-in-out;
		}

		> .nav-item.active > .nav-link > i,
		> .nav-item:hover > .nav-link > i,
		> .nav-item:focus > .nav-link > i {
			opacity: 1;
		}

		> .nav-item.active {
			> .nav-link {
				background-color: rgba(255, 255, 255, 0.333);
			}

			> .nav-link::after {
				background-color: #25D366;
				content: '';
				display: block;
				height: 100%;
				left: 0;
				position: absolute;
				top: 0;
				width: 4px;
			}
		}
	}
</style>
