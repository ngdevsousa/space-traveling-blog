import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FaCalendar, FaUser } from 'react-icons/fa';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<PostPagination>(() => {
    return postsPagination || undefined;
  });

  const formatDate = (date): string =>
    format(Date.parse(date), 'dd MMM yyyy', { locale: ptBR });
  const loadMorePosts = async (nextPageURL): Promise<void> => {
    if (!nextPageURL) return;
    const newPosts = await fetch(nextPageURL).then(res => res.json());
    setPosts({
      next_page: newPosts.next_page,
      results: [...posts.results, ...newPosts.results],
    } as PostPagination);
  };

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts?.results.map(p => (
            <Link key={p.uid} href={`/post/${p.uid}`}>
              <a>
                <strong>{p.data.title}</strong>
                <p>{p.data.subtitle}</p>
                <div className={styles.postFooter}>
                  <time>
                    <FaCalendar />
                    {formatDate(p.first_publication_date)}
                  </time>
                  <p>
                    <FaUser />
                    {p.data.author}
                  </p>
                </div>
              </a>
            </Link>
          ))}
          {posts?.next_page && (
            <button
              type="button"
              onClick={() => loadMorePosts(postsPagination.next_page)}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    { pageSize: 2 }
  );

  return {
    props: {
      postsPagination: {
        results: postsResponse.results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
