<style>
.list-group-item {
	z-index: auto !important;
}

/* Foreground should be white even when not a link */
.list-group .list-group-item.active {
	color: #FFF;
}

/* More pronounced rounding */
.list-group .list-group-item:first-child {
	border-top-left-radius: 0.5rem;
	border-top-right-radius: 0.5rem;
}

.list-group .list-group-item:last-child {
	border-bottom-left-radius: 0.5rem;
	border-bottom-right-radius: 0.5rem;
}

/* Remove rounding when a card-body item */
.card > .list-group .list-group-item {
	border-radius: 0;
}
</style>
