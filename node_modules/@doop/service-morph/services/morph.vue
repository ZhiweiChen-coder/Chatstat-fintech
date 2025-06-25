<script lang="js" frontend>
/**
* Simple service wrapper around Quasar's Morph utility
* @url https://v1.quasar.dev/quasar-utils/morph-utils
*
* @example morph one element into another
* morph({from: '#from-el', to: '#to-el'})
*/

import morph from 'quasar/src/utils/morph.js';

app.service('$morph', ()=> options => {
	return morph({
		easing: 'ease-out',
		duration: 300,
		tween: true,
		...options,
	});
});
</script>
