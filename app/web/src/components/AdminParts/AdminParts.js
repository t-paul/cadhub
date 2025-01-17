import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { Link, routes } from '@redwoodjs/router'

import { QUERY } from 'src/components/AdminPartsCell'

const DELETE_PART_MUTATION = gql`
  mutation DeletePartMutation($id: String!) {
    deletePart(id: $id) {
      id
    }
  }
`

const MAX_STRING_LENGTH = 150

const truncate = (text) => {
  let output = text
  if (text && text.length > MAX_STRING_LENGTH) {
    output = output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output
}

const timeTag = (datetime) => {
  return (
    <time dateTime={datetime} title={datetime}>
      {new Date(datetime).toUTCString()}
    </time>
  )
}

const checkboxInputTag = (checked) => {
  return <input type="checkbox" checked={checked} disabled />
}

const AdminParts = ({ parts }) => {
  const [deletePart] = useMutation(DELETE_PART_MUTATION, {
    onCompleted: () => {
      toast.success('Part deleted.')
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete part ' + id + '?')) {
      deletePart({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Description</th>
            <th>Code</th>
            <th>Main image</th>
            <th>Created at</th>
            <th>Updated at</th>
            <th>User id</th>
            <th>Deleted</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.id}>
              <td>{truncate(part.id)}</td>
              <td>{truncate(part.title)}</td>
              <td>{truncate(part.description)}</td>
              <td>{truncate(part.code)}</td>
              <td>{truncate(part.mainImage)}</td>
              <td>{timeTag(part.createdAt)}</td>
              <td>{timeTag(part.updatedAt)}</td>
              <td>{truncate(part.userId)}</td>
              <td>{checkboxInputTag(part.deleted)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.part({
                      userName: part?.user?.userName,
                      partTitle: part?.title,
                    })}
                    title={'Show part ' + part.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editPart({
                      userName: part?.user?.userName,
                      partTitle: part?.title,
                    })}
                    title={'Edit part ' + part.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <a
                    href="#"
                    title={'Delete part ' + part.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(part.id)}
                  >
                    Delete
                  </a>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminParts
