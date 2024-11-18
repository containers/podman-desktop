<script lang="ts">
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

export let conditions: {
  type: string;
  status: string;
  lastTransitionTime?: Date;
  reason?: string;
  message?: string;
}[];
</script>

<tr>
  <td colspan="2">
    <table class="w-full ml-2.5">
      <tbody>
        <tr>
          <th align="left">Type</th><th align="left">Status</th><th align="left">Updated</th><th align="left">Reason</th><th align="left">Message</th>
        </tr>
        {#each conditions as condition}
          <tr>
            <td>{condition.type}</td>
            <td>{condition.status}</td>
            <td>{humanizeDuration(moment().diff(condition.lastTransitionTime), { round: true, largest: 1 })}</td>
            <td>{condition.reason}</td>
            <td>{condition.message}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </td>
</tr>
