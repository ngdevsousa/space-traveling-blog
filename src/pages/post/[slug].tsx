import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { formatDate } from '../../services/dates';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  console.log(post.data);
  return (
    <>
      {post && (
        <>
          <Head>
            <title>{post.data.title}</title>
          </Head>
          <img
            src={post.data.banner.url}
            alt="banner"
            className={styles.banner}
          />
          <main className={commonStyles.container}>
            <article className={styles.postContent}>
              <h1>{post.data.title}</h1>
              <div className={styles.postDetails}>
                <time>
                  <FiCalendar />
                  {formatDate(post.first_publication_date)}
                </time>
                <p>
                  <FiUser />
                  {post.data.author}
                </p>
                <p>
                  <FiClock />4 min
                </p>
              </div>
              {post.data.content.map(c => (
                <div className={styles.postSection}>
                  <h1>{c.heading}</h1>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(c.body),
                    }}
                  />
                </div>
              ))}
            </article>
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    fallback: 'blocking',
    paths: [],
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response: Post = await prismic.getByUID('posts', String(slug), {});
  if (!response)
    return {
      props: null,
      redirect: 30 * 60,
    };

  const post: Post = {
    data: {
      title: response.data.title,
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
    },
    first_publication_date: response.first_publication_date,
  };

  return {
    props: {
      post,
    },
    redirect: 30 * 60,
  };
};
