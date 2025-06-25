<script lang="js" frontend>
import DigestFactory from './libs/digest-factory';

app.service('$digest', function() {
	return DigestFactory(this);
});
</script>
