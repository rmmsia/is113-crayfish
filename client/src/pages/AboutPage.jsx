import { Link } from 'react-router-dom'

export default function AboutPage() {
    return (
       <main className='page-content'>
        <h1>About</h1>
        <p>Crayfish is a social media platform for sharing and discovering content.</p>
        <p>The full <Link to="/usertree">user tree</Link> is available for exploration.</p>
       </main> 
    )
}