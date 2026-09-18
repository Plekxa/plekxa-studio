import UploadWorkspace from './UploadWorkspace';
export default async function WorkspacePage({params}:{params:Promise<{workspaceId:string}>}){const {workspaceId}=await params;return <main className="creator-projects-page"><div className="container"><UploadWorkspace workspaceId={workspaceId}/></div></main>}
