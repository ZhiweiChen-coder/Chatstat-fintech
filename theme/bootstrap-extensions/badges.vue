<style>
/* Padding around badges is a bit exteme in the default BS style {{{ */
.badge {
	padding: 0.6em 1em;
	font-size: 80%;
	margin-bottom: 5px;
}
/* }}} */
/* .badge-light is TOO light against white backgrounds {{{ */
.badge.badge-light {
	background-color: #e8e9ea;
}
/* }}} */
/* Badges next to one-another should have padding {{{ */
.badge:first-child {
	margin-right: 5px;
}

.badge + .badge {
	margin-right: 5px;
}
/* }}} */
</style>
