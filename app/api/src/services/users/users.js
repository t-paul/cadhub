import { db } from 'src/lib/db'
import { requireAuth } from 'src/lib/auth'
import { requireOwnership } from 'src/lib/owner'
import { UserInputError } from '@redwoodjs/api'
import { enforceAlphaNumeric, destroyImage } from 'src/services/helpers'

export const users = () => {
  requireAuth({ role: 'admin' })
  return db.user.findMany()
}

export const user = ({ id }) => {
  return db.user.findUnique({
    where: { id },
  })
}

export const userName = ({ userName }) => {
  return db.user.findUnique({
    where: { userName },
  })
}

export const createUser = ({ input }) => {
  requireAuth({ role: 'admin' })
  createUserInsecure({ input })
}
export const createUserInsecure = ({ input }) => {
  return db.user.create({
    data: input,
  })
}

export const updateUser = ({ id, input }) => {
  requireAuth()
  return db.user.update({
    data: input,
    where: { id },
  })
}

export const updateUserByUserName = async ({ userName, input }) => {
  requireAuth()
  await requireOwnership({ userName })
  if (input.userName) {
    input.userName = enforceAlphaNumeric(input.userName)
  }
  if (input.userName && ['new', 'edit', 'update'].includes(input.userName)) {
    //TODO complete this and use a regexp so that it's not case sensitive, don't want someone with the userName eDiT
    throw new UserInputError(
      `You've tried to used a protected word as you userName, try something other than `
    )
  }
  const originalPart = await db.user.findUnique({ where: { userName } })
  const imageToDestroy =
    originalPart.image !== input.image && originalPart.image
  const update = await db.user.update({
    data: input,
    where: { userName },
  })
  if (imageToDestroy) {
    // destroy after the db has been updated
    destroyImage({ publicId: imageToDestroy })
  }
  return update
}

export const deleteUser = ({ id }) => {
  requireAuth({ role: 'admin' })
  return db.user.delete({
    where: { id },
  })
}

export const User = {
  Parts: (_obj, { root }) =>
    db.user.findUnique({ where: { id: root.id } }).Part(),
  Part: (_obj, { root }) =>
    _obj.partTitle &&
    db.part.findUnique({
      where: {
        title_userId: {
          title: _obj.partTitle,
          userId: root.id,
        },
      },
    }),
  Reaction: (_obj, { root }) =>
    db.user.findUnique({ where: { id: root.id } }).Reaction(),
  Comment: (_obj, { root }) =>
    db.user.findUnique({ where: { id: root.id } }).Comment(),
  SubjectAccessRequest: (_obj, { root }) =>
    db.user.findUnique({ where: { id: root.id } }).SubjectAccessRequest(),
}
