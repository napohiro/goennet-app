import { useNavigate } from 'react-router-dom'
import Card from '../common/Card'
import Badge from '../common/Badge'
import { truncate } from '../../utils/formatUtils'

const DEPTH_BADGE = { 1: 'depth1', 2: 'depth2', 3: 'depth3', 4: 'depth4', 5: 'depth5' }

export default function ProfileCard({ profile, depth, originDepth, showLineage = false, onClick }) {
  const navigate = useNavigate()
  const isPromoted = depth === 1 && originDepth && originDepth > 1

  function handleClick() {
    if (onClick) return onClick(profile)
    navigate(`/profile/${profile.id}`)
  }

  return (
    <Card onClick={handleClick} className="active:scale-[0.98]">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} className="w-14 h-14 rounded-full object-cover border-2 border-goen-green-100" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-goen-green-100 flex items-center justify-center text-goen-green-700 font-bold text-xl">
              {(profile.display_name || '?')[0]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-stone-800 text-base">{profile.display_name}</span>
            {profile.handle_name && (
              <span className="text-stone-400 text-xs">@{profile.handle_name}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {depth != null && (
              <Badge variant={DEPTH_BADGE[Math.min(depth, 5)] || 'gray'}>
                {depth === 1 ? '直接' : `${depth}段階`}
              </Badge>
            )}
            {isPromoted && (
              <Badge variant="gold">元{originDepth}段</Badge>
            )}
          </div>

          {profile.catch_copy && (
            <p className="text-stone-500 text-sm mt-1">{truncate(profile.catch_copy, 50)}</p>
          )}
          {profile.how_i_can_help && (
            <p className="text-goen-green-700 text-sm mt-1 font-medium">{truncate(profile.how_i_can_help, 50)}</p>
          )}
        </div>

        <svg className="w-5 h-5 text-stone-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {profile.offer_tags && profile.offer_tags.length > 0 && (
        <div className="mt-2 flex gap-1.5 flex-wrap">
          {profile.offer_tags.slice(0, 4).map(tag => (
            <Badge key={tag} variant="gray" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
