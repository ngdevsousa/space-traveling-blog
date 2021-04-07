import Prismic from '@prismicio/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import { formatDate } from '../../services/dates';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  uid?: string;
  estimatedTime?: number;
  data: {
    title: string;
    subtitle: string;
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

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      {post && (
        <>
          <Head>
            <title>{post.data.title}</title>
          </Head>
          <Header />
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
                  <FiClock />
                  {post.estimatedTime} min
                </p>
              </div>
              {post.data.content.map((c, index) => (
                <div key={String(index)} className={styles.postSection}>
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
  const prismic = getPrismicClient();
  const posts: PostPagination = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      fetch: ['post.slug'],
    }
  );
  const paths = posts.results.map(p => {
    return { params: { slug: p.uid } };
  });
  return {
    fallback: true,
    paths,
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

  const reduceContentTime = (totalTime: number, content: any): number => {
    const wordsCount = RichText.asText(content.body).split(RegExp('[\\W+]+'))
      .length;
    return totalTime + wordsCount;
  };
  const estimatedTime = Math.ceil(
    response.data.content.reduce(reduceContentTime, 0) / 200
  );

  return {
    props: {
      post: { ...response, estimatedTime },
    },
    redirect: 30 * 60,
  };
};
