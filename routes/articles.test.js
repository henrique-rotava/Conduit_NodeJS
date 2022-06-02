const supertest = require('supertest');
const app = require('../app');
const Article = require('../models/Article');
const User = require('../models/User');
const { sign } = require('../utils/jwt');

const api = supertest(app);

describe('articles', () => {
    beforeEach(async () => {
        await Article.truncate();
        await User.truncate();
    });

    it('should save article', async () => {
        const user = await User.create({
            username: 'teste user',
            email: 'user@test.com',
            password: 'P4$$word'
        });
        const token = await sign(user);

        const { body } = await api
            .post('/api/articles')
            .set('Authorization', `Token ${token}`)
            .send({
                article: {
                    title: 'mature content',
                    body: 'body',
                    description: 'desc',
                    isMatureContent: true,
                    tagList: ['test']
                }
            });

        expect(body).toEqual({
            article: {
                slug: 'mature-content',
                title: 'mature content',
                body: 'body',
                description: 'desc',
                isMatureContent: true,
                UserEmail: 'user@test.com',
                tagList: ['test'],
                author: {
                    username: 'teste user',
                    bio: null,
                    image: null
                },
                createdAt: expect.anything(),
                updatedAt: expect.anything()
            }
        });
    });

    it('should update article', async () => {
        const user = await User.create({
            username: 'teste user',
            email: 'user@test.com',
            password: 'P4$$word'
        });
        const token = await sign(user);

        const article = await Article.create({
            slug: 'non-mature',
            title: 'non mature',
            body: 'body',
            description: 'desc',
            isMatureContent: false,
            UserEmail: user.email
        });

        const { body } = await api
            .patch(`/api/articles/${article.slug}`)
            .set('Authorization', `Token ${token}`)
            .send({
                article: {
                    title: 'title updated',
                    body: 'body updated',
                    description: 'desc updated',
                    isMatureContent: true
                }
            });

        expect(body).toEqual({
            article: {
                slug: 'non-mature',
                title: 'title updated',
                body: 'body updated',
                description: 'desc updated',
                isMatureContent: true,
                UserEmail: 'user@test.com',
                tagList: [],
                author: {
                    username: 'teste user',
                    bio: null,
                    image: null
                },
                createdAt: expect.anything(),
                updatedAt: expect.anything()
            }
        });
    });

    it('should get latest 10 mature articles', async () => {
        for (let index = 0; index < 12; index++) {
            const title = `test_${index}`;
            await Article.create({
                slug: title,
                title,
                body: 'body',
                description: 'desc',
                isMatureContent: true
            });
        }
        await Article.create({
            slug: 'non mature',
            title: 'non mature',
            body: 'body',
            description: 'desc',
            isMatureContent: false
        });

        const { body } = await api.get('/api/articles/news/mature').send();
        const result = body.articles.filter((article) => article.isMatureContent);
        expect(result.length).toEqual(10);
    });
});
