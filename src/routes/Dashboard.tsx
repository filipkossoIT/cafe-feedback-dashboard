import { Link } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { Topbar } from '../components/Topbar'
import { StatCards } from '../components/StatCards'
import { RatingChart } from '../components/RatingChart'
import { CommentsList } from '../components/CommentsList'
import { listByCafe } from '../lib/repos/feedback'

export default function Dashboard() {
  const { cafe } = useAuth()
  if (!cafe) return null
  const responses = listByCafe(cafe.id)
  return (
    <div className="app">
      <Topbar
        subtitle="Internal view"
        right={
          <div className="tabs">
            <Link className="tab" to={`/f/${cafe.slug}`}>Form</Link>
            <Link className="tab" to="/settings">Settings</Link>
          </div>
        }
      />
      <main>
        <div className="fade-in">
          <div className="dash-head">
            <div>
              <h1>Feedback dashboard</h1>
              <div className="sub">{cafe.name} — a live look at what your customers think</div>
            </div>
          </div>
          <StatCards responses={responses} />
          <RatingChart responses={responses} />
          <CommentsList responses={responses} />
        </div>
      </main>
    </div>
  )
}
