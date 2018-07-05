import { REPORT_VOTES_THRESHOLD } from '@/constants';

export function notDismissedReports(state) {
    return state.reports.filter((item) => {
        if (item.attributes.downvotes === 0) {
            return true;
        }
        return (item.attributes.upvotes / item.attributes.downvotes) > REPORT_VOTES_THRESHOLD;
    });
}
