import React, { useState, useEffect } from 'react';
import { Face, FACE_CROPS_CACHE_NAME, Person } from 'types/machineLearning';
import {
    getAllPeople,
    getPeopleList,
    getUnidentifiedFaces,
} from 'utils/machineLearning';
import styled from 'styled-components';
import { File } from 'services/fileService';
import { ImageCacheView } from './ImageViews';

const FaceChipContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin-top: 5px;
    margin-bottom: 5px;
`;

const FaceChip = styled.div`
    width: 112px;
    height: 112px;
    margin: 5px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    cursor: pointer;

    & > img {
        width: 100%;
        height: 100%;
    }
`;

interface PeopleListPropsBase {
    onSelect?: (person: Person, index: number) => void;
}

export interface PeopleListProps extends PeopleListPropsBase {
    people: Array<Person>;
}

export function PeopleList(props: PeopleListProps) {
    return (
        <FaceChipContainer>
            {props.people.map((person, index) => (
                <FaceChip
                    key={index}
                    onClick={() =>
                        props.onSelect && props.onSelect(person, index)
                    }>
                    <ImageCacheView
                        url={person.displayImageUrl}
                        cacheName={FACE_CROPS_CACHE_NAME}
                    />
                </FaceChip>
            ))}
        </FaceChipContainer>
    );
}

export interface PhotoPeopleListProps extends PeopleListPropsBase {
    file: File;
}

export function PhotoPeopleList(props: PhotoPeopleListProps) {
    const [people, setPeople] = useState<Array<Person>>([]);

    useEffect(() => {
        let didCancel = false;

        async function updateFaceImages() {
            console.log('calling getPeopleList');
            console.time('getPeopleList');
            const people = await getPeopleList(props.file);
            console.timeEnd('getPeopleList');
            console.log('getPeopleList done, didCancel: ', didCancel);
            !didCancel && setPeople(people);
        }

        updateFaceImages();

        return () => {
            didCancel = true;
        };
    }, [props.file]);

    return <PeopleList people={people} onSelect={props.onSelect}></PeopleList>;
}

export interface AllPeopleListProps extends PeopleListPropsBase {
    limit?: number;
}

export function AllPeopleList(props: AllPeopleListProps) {
    const [people, setPeople] = useState<Array<Person>>([]);

    useEffect(() => {
        let didCancel = false;

        async function updateFaceImages() {
            let people = await getAllPeople();
            if (props.limit) {
                people = people.slice(0, props.limit);
            }
            !didCancel && setPeople(people);
        }

        updateFaceImages();

        return () => {
            didCancel = true;
        };
    }, [props.limit]);

    return <PeopleList people={people} onSelect={props.onSelect}></PeopleList>;
}

export function UnidentifiedFaces(props: { file: File }) {
    const [faces, setFaces] = useState<Array<Face>>([]);

    useEffect(() => {
        let didCancel = false;

        async function updateFaceImages() {
            const faces = await getUnidentifiedFaces(props.file);
            !didCancel && setFaces(faces);
        }

        updateFaceImages();

        return () => {
            didCancel = true;
        };
    }, [props.file]);

    return (
        <FaceChipContainer>
            {faces &&
                faces.map((face, index) => (
                    <FaceChip key={index}>
                        <ImageCacheView
                            url={face.crop?.imageUrl}
                            cacheName={FACE_CROPS_CACHE_NAME}
                        />
                    </FaceChip>
                ))}
        </FaceChipContainer>
    );
}
