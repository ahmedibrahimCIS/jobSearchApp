import { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLBoolean, GraphQLID } from 'graphql';
import { userModel } from '../../DB/models/userModel.js';
import { Company } from '../../DB/models/companyModel.js';

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        role: { type: GraphQLString },
        bannedAt: { type: GraphQLString },
    })
});

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        _id: { type: GraphQLString },
        companyName: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: GraphQLString },
        approvedByAdmin: { type: GraphQLBoolean },
        bannedAt: { type: GraphQLString },
    })
});

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        allData: {
            type: new GraphQLObjectType({
                name: 'AllData',
                fields: {
                    users: { type: new GraphQLList(UserType) },
                    companies: { type: new GraphQLList(CompanyType) },
                }
            }),
            resolve: async () => {
                const users = await userModel.find();
                const companies = await Company.find();
                return { users, companies };
            }
        }
    }
});

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        banUser: {
            type: UserType,
            args: { userId: { type: GraphQLID } }, 
            resolve: async (_, { userId }) => {
                return await userModel.findByIdAndUpdate(userId, { bannedAt: new Date() }, { new: true });
            }
        },
        unbanUser: {
            type: UserType,
            args: { userId: { type: GraphQLID } },
            resolve: async (_, { userId }) => {
                return await userModel.findByIdAndUpdate(userId, { bannedAt: null }, { new: true });
            }
        },
        banCompany: {
            type: CompanyType,
            args: { companyId: { type: GraphQLID } },
            resolve: async (_, { companyId }) => {
                return await Company.findByIdAndUpdate(companyId, { bannedAt: new Date() }, { new: true });
            }
        },
        unbanCompany: {
            type: CompanyType,
            args: { companyId: { type: GraphQLID } },
            resolve: async (_, { companyId }) => {
                return await Company.findByIdAndUpdate(companyId, { bannedAt: null }, { new: true });
            }
        },
        approveCompany: {
            type: CompanyType,
            args: { companyId: { type: GraphQLID } },
            resolve: async (_, { companyId }) => {
                return await Company.findByIdAndUpdate(companyId, { approvedByAdmin: true }, { new: true });
            }
        }
    }
});
const schema = new GraphQLSchema({ query: QueryType, mutation: MutationType });

export default schema;
