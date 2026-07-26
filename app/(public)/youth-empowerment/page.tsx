import * as Outreach from '../outreach/page';

const Page = (Outreach as any).default ?? Outreach;
const metadata = (Outreach as any).metadata ?? (Page as any).metadata;

export default Page;
export { metadata };
