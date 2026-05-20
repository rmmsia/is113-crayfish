import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'


function TreeNode({ node, prefix = '', isLast = true, isRoot = false }) {
  // Logic for connectors
  const connector = isRoot ? '' : (isLast ? '└── ' : '├── ');
  const newPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ');

  return (
    <>
      <div className="tree-node">
        {/* The visual lines: e.g., │   ├── */}
        <span className="tree-prefix">{prefix}{connector}</span>
        

        <Link to={`/profile/${node.username}`} className="tree-username">
          {node.username}
        </Link>
        
        {/* Karma display */}
        <span className="tree-karma"> ({node.karma})</span>
      </div>
      
      {/* If this user invited people, render their children recursively */}
      {node.children && node.children.length > 0 && (
        node.children.map((child, i) => (
          <TreeNode 
            key={child.username} 
            node={child} 
            prefix={newPrefix} 
            isLast={i === node.children.length - 1} 
            isRoot={false} 
          />
        ))
      )}
    </>
  )
}

export default function UserTreePage() {
  const [treeData, setTreeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch the JSON from the backend route we just updated
    fetch('http://localhost:3000/usertree', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user tree')
        return res.json()
      })
      .then(data => {
        setTreeData(data.tree || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <main className="page-content"><p>Loading tree...</p></main>
  if (error) return <main className="page-content"><p style={{ color: 'red' }}>{error}</p></main>

  return (
    <main className="page-content">
      <h1>User Invite Tree</h1>
      
      <div className="user-tree">
        {treeData.length > 0 ? (
          treeData.map((root) => (
            <TreeNode 
              key={root.username} 
              node={root} 
              isRoot={true} 
            />
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </main>
  )
}