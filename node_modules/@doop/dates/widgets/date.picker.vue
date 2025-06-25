<script lang="js" frontend>
/**
* Import the vuejs-datepicker as date-picker
* @url https://www.npmjs.com/package/vuejs-datepicker
*
* @example Simple date binding
* <date-picker v-model="myDate"/>
*
* @example Expanded binding
* <date-picker :value="myDate" @selected="myDate = $event"/>
*/
import Datepicker from 'vuejs-datepicker';

app.component('datePicker', Datepicker);
</script>
